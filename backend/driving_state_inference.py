import numpy as np
from typing import Dict, Any, Tuple


class DrivingStateInference:
    """驾驶场景下的表情状态推断引擎"""

    def __init__(self):
        """初始化状态标签和阈值"""
        self.state_labels = {
            'drowsy': '疲劳驾驶',
            'alert': '警觉状态',
            'angry': '愤怒驾驶',
            'distracted': '分心状态',
            'stressed': '压力驾驶',
            'relaxed': '放松状态',
            'surprised': '惊讶警觉',
            'sad': '压抑状态'
        }

        self.risk_levels = {
            'drowsy': ('红色', 'critical'),
            'alert': ('绿色', 'safe'),
            'angry': ('红色', 'high'),
            'distracted': ('黄色', 'medium'),
            'stressed': ('橙色', 'high'),
            'relaxed': ('绿色', 'safe'),
            'surprised': ('黄色', 'medium'),
            'sad': ('黄色', 'medium')
        }

    def infer_driving_state(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        根据三模态结果推断驾驶状态

        Args:
            results: IntegratedEmotionPredictor.predict() 的输出结果

        Returns:
            包含驾驶状态、风险等级、置信度等的字典
        """
        # 解析三模态数据
        va_data = results['Valence_Arousal']
        fer_data = results['Emotion_Classification']
        au_data = results['AU_Recognition']

        valence = va_data['valence']
        arousal = va_data['arousal']
        emotion = fer_data['predicted_emotion']
        active_aus = set(au_data['active_AUs'])
        au_details = au_data['detailed_results']

        # 计算AU活跃度指标
        au_active_count = len(active_aus)
        au_confidence_mean = np.mean([au_details[au]['confidence']
                                      for au in au_details])

        # 规则推断
        state, confidence, details = self._apply_rules(
            valence, arousal, emotion,
            active_aus, au_active_count,
            au_confidence_mean, au_details
        )

        # 组织输出
        color, risk_level = self.risk_levels[state]

        return {
            'driving_state': self.state_labels[state],
            'state_code': state,
            'risk_level': risk_level,
            'risk_color': color,
            'confidence': confidence,
            'recommendation': self._get_recommendation(state),
            'details': details
        }

    def _apply_rules(self, valence: float, arousal: float,
                     emotion: str, active_aus: set,
                     au_count: int, au_mean: float,
                     au_details: Dict) -> Tuple[str, float, Dict]:
        """
        应用融合规则进行状态推断

        Returns:
            (state_code, confidence, detail_info)
        """

        # 规则1: 疲劳识别（优先级最高）
        if self._check_drowsy(valence, arousal, emotion, au_count, au_details):
            confidence = self._calc_drowsy_confidence(valence, arousal, emotion, au_count)
            return 'drowsy', confidence, {
                'trigger': '低覆盖度+低觉醒度+AU不活跃',
                'arousal': arousal,
                'active_au_count': au_count
            }

        # 规则2: 愤怒识别
        if self._check_angry(valence, arousal, emotion, active_aus, au_details):
            confidence = self._calc_angry_confidence(valence, arousal, emotion, au_details)
            return 'angry', confidence, {
                'trigger': '低价值+高觉醒+愤怒表情',
                'valence': valence,
                'arousal': arousal,
                'key_aus': list(active_aus & {'AU4', 'AU7', 'AU23'})
            }

        # 规则3: 紧张识别
        if self._check_stressed(valence, arousal, emotion, active_aus, au_details):
            confidence = self._calc_stressed_confidence(valence, arousal, emotion, au_details)
            return 'stressed', confidence, {
                'trigger': '高觉醒+低价值+恐惧/厌恶表情',
                'valence': valence,
                'arousal': arousal,
                'key_aus': list(active_aus & {'AU4', 'AU5', 'AU17'})
            }

        # 规则4: 警觉识别
        if self._check_alert(valence, arousal, emotion, active_aus, au_details):
            confidence = self._calc_alert_confidence(valence, arousal, emotion, au_details)
            return 'alert', confidence, {
                'trigger': '高觉醒+惊讶/适中表情',
                'arousal': arousal,
                'key_aus': list(active_aus & {'AU1', 'AU2', 'AU5'})
            }

        # 规则5: 分心识别
        if self._check_distracted(valence, arousal, emotion, au_count, au_details):
            confidence = self._calc_distracted_confidence(valence, arousal, emotion, au_count)
            return 'distracted', confidence, {
                'trigger': '低AU活跃+中等觉醒+表情呆板',
                'active_au_count': au_count,
                'au_mean_confidence': au_mean
            }

        # 规则6: 惊讶识别
        if emotion == 'Surprise' and arousal > 0.65:
            confidence = min(0.9, arousal * 0.8)
            return 'surprised', confidence, {
                'trigger': '惊讶表情+高觉醒',
                'arousal': arousal
            }

        # 规则7: 压抑识别
        if emotion == 'Sad' and arousal < 0.5:
            confidence = 0.7
            return 'sad', confidence, {
                'trigger': '伤心表情+低-中觉醒',
                'emotion': emotion,
                'arousal': arousal
            }

        # 规则8: 放松识别（默认安全状态）
        if self._check_relaxed(valence, arousal, emotion, au_count):
            confidence = self._calc_relaxed_confidence(valence, arousal, emotion, au_count)
            return 'relaxed', confidence, {
                'trigger': '适中VA+中性/愉快表情+AU活跃适中',
                'valence': valence,
                'arousal': arousal
            }

        # 默认：放松
        return 'relaxed', 0.5, {'trigger': '默认安全状态'}

    # ========== 各状态检查函数 ==========

    def _check_drowsy(self, valence, arousal, emotion, au_count, au_details) -> bool:
        """检查是否为疲劳状态"""
        # 条件1: 觉醒度很低
        low_arousal = arousal < 0.25

        # 条件2: 价值度也低
        low_valence = valence < 0.3

        # 条件3: 表情呆板（AU很少激活）
        inactive = au_count <= 3

        # 条件4: 表情为Sad/Neutral
        emotion_match = emotion in ['Sad', 'Neutral']

        # 综合判断
        return (low_arousal and low_valence and inactive) or \
               (arousal < 0.2 and emotion_match)

    def _check_angry(self, valence, arousal, emotion, active_aus, au_details) -> bool:
        """检查是否为愤怒状态"""
        # FER匹配
        emotion_match = emotion == 'Angry'

        # VA匹配: 低价值 + 高觉醒
        va_match = valence < 0.2 and arousal > 0.6

        # AU匹配: 皱眉(AU4) + 眼睛(AU7) 同时激活
        au_match = 'AU4' in active_aus or 'AU7' in active_aus

        return (emotion_match and arousal > 0.65) or \
               (va_match and au_match) or \
               (emotion_match and va_match)

    def _check_stressed(self, valence, arousal, emotion, active_aus, au_details) -> bool:
        """检查是否为压力/紧张状态"""
        # 高觉醒 + 低价值
        va_match = arousal > 0.6 and valence < 0.3

        # 表情匹配
        emotion_match = emotion in ['Fear', 'Disgust', 'Angry']

        # AU确认: 皱眉等紧张信号
        au_match = 'AU4' in active_aus

        return va_match and (emotion_match or au_match)

    def _check_alert(self, valence, arousal, emotion, active_aus, au_details) -> bool:
        """检查是否为警觉状态"""
        # 高觉醒
        high_arousal = arousal > 0.65

        # 表情匹配
        emotion_match = emotion in ['Surprise', 'Happy', 'Neutral']

        # AU匹配: 眉毛抬起(AU1/2/5)
        au_match = any(au in active_aus for au in ['AU1', 'AU2', 'AU5'])

        return high_arousal and (emotion_match or au_match)

    def _check_distracted(self, valence, arousal, emotion, au_count, au_details) -> bool:
        """检查是否为分心状态"""
        # AU活跃度很低
        inactive = au_count <= 2

        # 表情呆板
        emotion_match = emotion in ['Sad', 'Neutral']

        # 觉醒度不高也不低
        moderate_arousal = 0.2 < arousal < 0.5

        # 价值度中性偏低
        low_valence = -0.1 < valence < 0.2

        return (inactive and emotion_match) or \
               (moderate_arousal and low_valence and au_count <= 3)

    def _check_relaxed(self, valence, arousal, emotion, au_count) -> bool:
        """检查是否为放松状态"""
        # VA适中
        va_ok = 0.3 <= arousal <= 0.7 and valence > 0.1

        # 表情积极或中性
        emotion_ok = emotion in ['Neutral', 'Happy', 'Surprise']

        # AU活跃度适中
        au_ok = 2 <= au_count <= 6

        return va_ok and emotion_ok and au_ok

    # ========== 置信度计算函数 ==========

    def _calc_drowsy_confidence(self, valence, arousal, emotion, au_count) -> float:
        """计算疲劳状态的置信度"""
        score = 0.0

        # Arousal贡献 (0.4分权重)
        if arousal < 0.15:
            score += 0.4
        elif arousal < 0.25:
            score += 0.3

        # Valence贡献 (0.3分权重)
        if valence < 0.2:
            score += 0.3
        elif valence < 0.3:
            score += 0.2

        # AU贡献 (0.3分权重)
        if au_count <= 2:
            score += 0.3
        elif au_count <= 3:
            score += 0.2

        return min(0.95, max(0.5, score))

    def _calc_angry_confidence(self, valence, arousal, emotion, au_details) -> float:
        """计算愤怒状态的置信度"""
        score = 0.0

        # FER贡献
        if emotion == 'Angry':
            score += 0.4

        # VA贡献
        if valence < 0.2 and arousal > 0.65:
            score += 0.3

        # AU贡献
        if 'AU4' in au_details and au_details['AU4']['confidence'] > 0.6:
            score += 0.3

        return min(0.95, max(0.5, score))

    def _calc_stressed_confidence(self, valence, arousal, emotion, au_details) -> float:
        """计算压力状态的置信度"""
        score = 0.0

        if arousal > 0.6 and valence < 0.3:
            score += 0.35

        if emotion in ['Fear', 'Disgust']:
            score += 0.35

        if 'AU4' in au_details and au_details['AU4']['confidence'] > 0.5:
            score += 0.3

        return min(0.9, max(0.5, score))

    def _calc_alert_confidence(self, valence, arousal, emotion, au_details) -> float:
        """计算警觉状态的置信度"""
        score = 0.0

        if arousal > 0.7:
            score += 0.4

        if emotion in ['Surprise', 'Happy']:
            score += 0.3

        key_aus = [au for au in ['AU1', 'AU2', 'AU5'] if au in au_details]
        if len(key_aus) > 0:
            score += 0.3

        return min(0.9, max(0.5, score))

    def _calc_distracted_confidence(self, valence, arousal, emotion, au_count) -> float:
        """计算分心状态的置信度"""
        score = 0.0

        if au_count <= 2:
            score += 0.4

        if emotion in ['Sad', 'Neutral']:
            score += 0.3

        if 0.2 < arousal < 0.5:
            score += 0.3

        return min(0.85, max(0.5, score))

    def _calc_relaxed_confidence(self, valence, arousal, emotion, au_count) -> float:
        """计算放松状态的置信度"""
        score = 0.0

        if 0.3 <= arousal <= 0.7:
            score += 0.35

        if valence > 0.3:
            score += 0.35

        if emotion in ['Neutral', 'Happy']:
            score += 0.3

        return min(0.9, max(0.5, score))

    def _get_recommendation(self, state: str) -> str:
        """根据状态返回建议"""
        recommendations = {
            'drowsy': '⚠️ 立即停车休息！检查是否充足睡眠。',
            'alert': '✓ 保持当前状态，继续安全驾驶。',
            'angry': '🔴 建议冷静，降低车速，避免激进驾驶。',
            'distracted': '⚠️ 集中注意力！检查是否有外界干扰。',
            'stressed': '🟡 放缓车速，做几个深呼吸放松压力。',
            'relaxed': '✓ 心态平和，可继续正常驾驶。',
            'surprised': '⚠️ 谨慎驾驶，可能发现突发情况。',
            'sad': '🟡 建议休息调整心情后再驾驶。'
        }
        return recommendations.get(state, '检查驾驶状态')
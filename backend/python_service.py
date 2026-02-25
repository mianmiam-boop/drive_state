from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import sys
import os
import numpy as np
import tempfile

sys.path.append('/path/to/your/model')  # 添加你的模型路径

from three import IntegratedEmotionPredictor

app = Flask(__name__)
CORS(app)  # 允许跨域
app.config['MAX_CONTENT_LENGTH'] = 52428800  # 50MB

# 初始化模型（在启动时只加载一次）
print("Initializing models...")
predictor = IntegratedEmotionPredictor(
    au_model_path='models/alexnet_ensemble.pth',
    fer_model_path='models/best_checkpoint.tar',
    affect_model_path='models/AffectNet.pth',
    device='cuda'  # 如果没有GPU，改为 'cpu'
)
print("Models loaded successfully!")


class FatigueDetector:
    """驾驶疲劳检测引擎 - 将三模态结果映射为疲劳等级"""
    
    def __init__(self):
        # 疲劳相关的AU单元
        self.fatigue_aus = {
            'AU1',   # 内眉提升
            'AU2',   # 外眉提升
            'AU4',   # 皱眉
            'AU5',   # 上睑提升
            'AU7',   # 眼睑收紧
            'AU43',  # 眼睑闭合
            'AU45',  # 眨眼
        }
        
        # 疲劳相关的表情
        self.fatigue_emotions = ['Sad', 'Neutral']
        
        # 疲劳等级定义
        self.fatigue_levels = {
            0: {
                'name': '正常状态',
                'description': '驾驶员精神状态良好，注意力集中',
                'color': 'green',
                'risk': 'safe',
                'recommendation': '✓ 状态良好，继续保持安全驾驶'
            },
            1: {
                'name': '轻度疲劳',
                'description': '出现轻微疲劳迹象，建议注意休息',
                'color': 'yellow',
                'risk': 'low',
                'recommendation': '⚠️ 建议适当休息，保持警觉'
            },
            2: {
                'name': '中度疲劳',
                'description': '疲劳特征明显，需要尽快休息',
                'color': 'orange',
                'risk': 'medium',
                'recommendation': '🔶 请尽快找安全地点休息'
            },
            3: {
                'name': '重度疲劳',
                'description': '严重疲劳，存在安全隐患，必须立即停车',
                'color': 'red',
                'risk': 'critical',
                'recommendation': '🔴 危险！请立即停车休息！'
            }
        }
    
    def detect_fatigue(self, results: dict) -> dict:
        """
        基于三模态结果检测疲劳等级
        
        Args:
            results: IntegratedEmotionPredictor.predict() 的输出结果
            
        Returns:
            疲劳检测结果字典
        """
        # 提取三模态数据
        va_data = results['Valence_Arousal']
        fer_data = results['Emotion_Classification']
        au_data = results['AU_Recognition']
        
        valence = va_data['valence']
        arousal = va_data['arousal']
        emotion = fer_data['predicted_emotion']
        active_aus = set(au_data['active_AUs'])
        au_details = au_data['detailed_results']
        
        # 计算疲劳指标
        fatigue_score = self._calculate_fatigue_score(
            valence, arousal, emotion, active_aus, au_details
        )
        
        # 确定疲劳等级
        fatigue_level = self._determine_fatigue_level(fatigue_score)
        
        # 获取等级信息
        level_info = self.fatigue_levels[fatigue_level]
        
        # 计算置信度
        confidence = self._calculate_confidence(fatigue_score, fatigue_level)
        
        # 组织返回结果
        return {
            'fatigue_level': fatigue_level,
            'fatigue_name': level_info['name'],
            'description': level_info['description'],
            'risk_level': level_info['risk'],
            'risk_color': level_info['color'],
            'recommendation': level_info['recommendation'],
            'confidence': confidence,
            'fatigue_score': fatigue_score,
            'indicators': {
                'valence': float(valence),
                'arousal': float(arousal),
                'emotion': emotion,
                'active_aus': list(active_aus),
                'fatigue_related_aus': list(active_aus & self.fatigue_aus)
            },
            'detailed_analysis': self._get_detailed_analysis(
                valence, arousal, emotion, active_aus, fatigue_score
            )
        }
    
    def _calculate_fatigue_score(
        self, 
        valence: float, 
        arousal: float, 
        emotion: str, 
        active_aus: set,
        au_details: dict
    ) -> float:
        """
        计算疲劳综合得分 (0-100)
        分数越高表示疲劳程度越严重
        """
        score = 0.0
        
        # 1. 觉醒度指标 (40分权重)
        # 觉醒度越低，疲劳分数越高
        if arousal < 0.2:
            score += 40
        elif arousal < 0.3:
            score += 30
        elif arousal < 0.4:
            score += 20
        elif arousal < 0.5:
            score += 10
        
        # 2. 效价值指标 (20分权重)
        # 效价值越低，疲劳可能性越高
        if valence < 0.1:
            score += 20
        elif valence < 0.2:
            score += 15
        elif valence < 0.3:
            score += 10
        elif valence < 0.4:
            score += 5
        
        # 3. 表情指标 (20分权重)
        if emotion in ['Sad']:
            score += 20
        elif emotion in ['Neutral']:
            score += 10
        elif emotion in ['Fear', 'Disgust']:
            score += 5
        
        # 4. AU单元指标 (20分权重)
        fatigue_au_count = len(active_aus & self.fatigue_aus)
        if fatigue_au_count <= 1:
            score += 20  # AU很少激活，可能疲劳
        elif fatigue_au_count <= 2:
            score += 15
        elif fatigue_au_count <= 3:
            score += 10
        
        # 特殊AU加权
        if 'AU43' in au_details or 'AU45' in au_details:  # 眼睑闭合/眨眼
            # 如果这些AU的置信度很高，增加疲劳分数
            for au in ['AU43', 'AU45']:
                if au in au_details and au_details[au]['confidence'] > 0.7:
                    score += 10
        
        # 5. 综合评估加成
        # 如果低觉醒度 + 低效价 + 疲劳表情同时出现，额外加分
        if arousal < 0.3 and valence < 0.3 and emotion in self.fatigue_emotions:
            score += 10
        
        # 限制分数范围
        return min(100.0, max(0.0, score))
    
    def _determine_fatigue_level(self, fatigue_score: float) -> int:
        """
        根据疲劳分数确定疲劳等级
        
        分数区间:
        0-25:   正常状态
        26-50:  轻度疲劳
        51-75:  中度疲劳
        76-100: 重度疲劳
        """
        if fatigue_score <= 25:
            return 0
        elif fatigue_score <= 50:
            return 1
        elif fatigue_score <= 75:
            return 2
        else:
            return 3
    
    def _calculate_confidence(self, fatigue_score: float, fatigue_level: int) -> float:
        """
        计算检测置信度
        
        置信度基于疲劳分数与等级边界的距离
        """
        # 等级边界
        boundaries = [0, 25, 50, 75, 100]
        
        lower_bound = boundaries[fatigue_level]
        upper_bound = boundaries[fatigue_level + 1] if fatigue_level < 3 else 100
        
        # 计算分数在当前等级区间的位置
        range_size = upper_bound - lower_bound
        distance_from_lower = fatigue_score - lower_bound
        
        # 在区间中心位置置信度最高
        center_distance = abs(distance_from_lower - range_size / 2)
        confidence = 1.0 - (center_distance / (range_size / 2)) * 0.3
        
        # 限制范围在 0.6-0.95
        return min(0.95, max(0.60, confidence))
    
    def _get_detailed_analysis(
        self,
        valence: float,
        arousal: float,
        emotion: str,
        active_aus: set,
        fatigue_score: float
    ) -> str:
        """生成详细的分析说明"""
        analysis_parts = []
        
        # 觉醒度分析
        if arousal < 0.25:
            analysis_parts.append(f"觉醒度极低({arousal:.2f})，这是严重疲劳的主要指标")
        elif arousal < 0.4:
            analysis_parts.append(f"觉醒度偏低({arousal:.2f})，显示疲劳迹象")
        elif arousal < 0.6:
            analysis_parts.append(f"觉醒度一般({arousal:.2f})")
        else:
            analysis_parts.append(f"觉醒度良好({arousal:.2f})")
        
        # 效价值分析
        if valence < 0.2:
            analysis_parts.append(f"情绪效价很低({valence:.2f})，可能伴有消极情绪")
        elif valence < 0.4:
            analysis_parts.append(f"情绪效价偏低({valence:.2f})")
        
        # 表情分析
        if emotion in self.fatigue_emotions:
            analysis_parts.append(f"检测到疲劳相关表情({emotion})")
        
        # AU分析
        fatigue_aus_detected = active_aus & self.fatigue_aus
        if len(fatigue_aus_detected) > 0:
            analysis_parts.append(
                f"检测到{len(fatigue_aus_detected)}个疲劳相关AU单元: {', '.join(fatigue_aus_detected)}"
            )
        
        # 综合评分
        analysis_parts.append(f"综合疲劳评分: {fatigue_score:.1f}/100")
        
        return "；".join(analysis_parts)


# 初始化疲劳检测器
fatigue_detector = FatigueDetector()


@app.route('/api/detect/image', methods=['POST'])
def detect_image():
    """图像疲劳检测接口"""
    filepath = None
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': '没有上传文件'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': '没有选择文件'}), 400

        # 使用 tempfile 创建临时文件（跨平台兼容）
        # 获取文件扩展名
        filename = secure_filename(file.filename)
        file_ext = os.path.splitext(filename)[1]
        
        # 创建临时文件
        fd, filepath = tempfile.mkstemp(suffix=file_ext)
        os.close(fd)  # 关闭文件描述符
        
        # 保存上传的文件
        file.save(filepath)
        
        print(f"处理文件: {filepath}")

        # 1. 运行三模态检测
        emotion_results = predictor.predict(filepath, au_threshold=0.5)

        # 2. 进行疲劳分析
        fatigue_result = fatigue_detector.detect_fatigue(emotion_results)

        # 3. 组织返回数据
        response = {
            'success': True,
            'fatigue_level': fatigue_result['fatigue_level'],
            'fatigue_name': fatigue_result['fatigue_name'],
            'description': fatigue_result['description'],
            'risk_level': fatigue_result['risk_level'],
            'risk_color': fatigue_result['risk_color'],
            'recommendation': fatigue_result['recommendation'],
            'confidence': fatigue_result['confidence'],
            'fatigue_score': fatigue_result['fatigue_score'],
            'indicators': fatigue_result['indicators'],
            'detailed_analysis': fatigue_result['detailed_analysis'],
            'timestamp': emotion_results.get('timestamp', None)
        }

        print(f"检测完成: 疲劳等级 L{fatigue_result['fatigue_level']}")
        
        return jsonify(response)

    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"错误: {error_msg}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'error': error_msg}), 500
    
    finally:
        # 清理临时文件
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
                print(f"已清理临时文件: {filepath}")
            except Exception as e:
                print(f"清理临时文件失败: {e}")


@app.route('/api/detect/video', methods=['POST'])
def detect_video():
    """视频疲劳检测接口"""
    filepath = None
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': '没有上传文件'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': '没有选择文件'}), 400

        # 使用 tempfile 创建临时文件
        filename = secure_filename(file.filename)
        file_ext = os.path.splitext(filename)[1]
        
        fd, filepath = tempfile.mkstemp(suffix=file_ext)
        os.close(fd)
        
        file.save(filepath)
        
        print(f"处理视频文件: {filepath}")

        # TODO: 实现视频检测逻辑
        # 这里可以提取关键帧进行检测
        # 暂时返回示例结果
        response = {
            'success': True,
            'fatigue_level': 1,
            'fatigue_name': '轻度疲劳',
            'description': '视频检测功能开发中',
            'risk_level': 'low',
            'risk_color': 'yellow',
            'recommendation': '建议适当休息',
            'confidence': 0.85,
            'fatigue_score': 35.0,
            'indicators': {
                'valence': 0.45,
                'arousal': 0.55,
                'emotion': 'Neutral',
                'active_aus': ['AU1', 'AU2'],
                'fatigue_related_aus': ['AU1', 'AU2']
            },
            'detailed_analysis': '视频检测功能正在开发中'
        }
        
        return jsonify(response)

    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"错误: {error_msg}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'error': error_msg}), 500
    
    finally:
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"清理临时文件失败: {e}")


@app.route('/health', methods=['GET'])
def health():
    """健康检查接口"""
    return jsonify({
        'status': 'ok',
        'model_loaded': True,
        'service': 'Fatigue Detection Service'
    })


@app.route('/api/info', methods=['GET'])
def info():
    """服务信息接口"""
    return jsonify({
        'service_name': 'Driver Fatigue Detection Service',
        'version': '2.0',
        'fatigue_levels': {
            0: '正常状态',
            1: '轻度疲劳',
            2: '中度疲劳',
            3: '重度疲劳'
        },
        'detection_method': '基于三模态（VA、FER、AU）融合的疲劳检测',
        'models': {
            'AU': 'AlexNet Ensemble',
            'FER': 'ResNet18',
            'VA': 'AffectNet'
        }
    })


if __name__ == '__main__':
    print("\n" + "="*60)
    print("Driver Fatigue Detection Service Starting...")
    print("="*60)
    print("Fatigue Levels:")
    for level, info in fatigue_detector.fatigue_levels.items():
        print(f"  Level {level}: {info['name']} - {info['description']}")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
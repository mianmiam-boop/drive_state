import torch
import torch.nn as nn
from torchvision import transforms
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from typing import Dict, List, Tuple, Any

# 导入你的模型结构
from Model.alexnet import alexnet  # AU模型


# ========== FER模型结构定义 ==========
class BasicBlock(nn.Module):
    expansion = 1

    def __init__(self, inplanes, planes, stride=1, shortcut=None):
        super(BasicBlock, self).__init__()
        self.conv1 = nn.Conv2d(inplanes, planes, kernel_size=3, stride=stride,
                               padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(planes)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(planes, planes, kernel_size=3, stride=1,
                               padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(planes)
        self.shortcut = shortcut

    def forward(self, x):
        residual = x
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)
        out = self.conv2(out)
        out = self.bn2(out)
        if self.shortcut is not None:
            residual = self.shortcut(x)
        out += residual
        out = self.relu(out)
        return out


class ResNet18(nn.Module):
    def __init__(self, num_classes=7):
        super(ResNet18, self).__init__()
        self.inplanes = 64
        self.conv1 = nn.Conv2d(1, 64, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(64)
        self.relu = nn.ReLU(inplace=True)
        self.maxpool = nn.MaxPool2d(kernel_size=2, stride=2, padding=0)
        self.layer1 = self._make_layer(BasicBlock, 64, 2)
        self.layer2 = self._make_layer(BasicBlock, 128, 2, stride=2)
        self.layer3 = self._make_layer(BasicBlock, 256, 2, stride=2)
        self.layer4 = self._make_layer(BasicBlock, 512, 2, stride=2)
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.linear = nn.Linear(512, num_classes)

    def _make_layer(self, block, planes, blocks, stride=1):
        shortcut = None
        if stride != 1 or self.inplanes != planes * block.expansion:
            shortcut = nn.Sequential(
                nn.Conv2d(self.inplanes, planes * block.expansion,
                          kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(planes * block.expansion),
            )
        layers = []
        layers.append(block(self.inplanes, planes, stride, shortcut))
        self.inplanes = planes * block.expansion
        for _ in range(1, blocks):
            layers.append(block(self.inplanes, planes))
        return nn.Sequential(*layers)

    def forward(self, x):
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = self.avgpool(x)
        x = x.view(x.size(0), -1)
        x = self.linear(x)
        return x


# ========== AffectNet模型结构定义(仅回归头) ==========
class AffectNetModel(nn.Module):
    """AffectNet回归模型 - 只包含全连接层,期望512维特征输入"""

    def __init__(self, pretrained=False, use_attention=True):
        super(AffectNetModel, self).__init__()
        self.use_attention = use_attention

        # 回归网络(与权重文件匹配)
        self.network = nn.Sequential(
            nn.Linear(512, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(128, 2)  # 输出 valence 和 arousal
        )

    def forward(self, x):
        # 输入应该是512维特征
        return self.network(x)


# ========== 特征提取器(用于AffectNet) ==========
class SimpleFeatureExtractor(nn.Module):
    """简单的卷积特征提取器,输出512维特征"""

    def __init__(self):
        super(SimpleFeatureExtractor, self).__init__()
        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(3, 64, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),

            # Block 2
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),

            # Block 3
            nn.Conv2d(128, 256, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),

            # Block 4
            nn.Conv2d(256, 512, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),

            # Global pooling
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten()
        )

    def forward(self, x):
        return self.features(x)


# ========== 集成预测器 ==========
class IntegratedEmotionPredictor:
    """集成AU识别、FER分类和VA回归的多模态情感预测器"""

    def __init__(self,
                 au_model_path: str,
                 fer_model_path: str,
                 affect_model_path: str,
                 device='cuda'):
        """
        初始化集成预测器

        Args:
            au_model_path: AU识别模型路径
            fer_model_path: FER表情分类模型路径
            affect_model_path: AffectNet VA回归模型路径
            device: 计算设备
        """
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')

        # 加载三个模型
        print("=" * 60)
        print("正在加载模型...")
        print("=" * 60)

        self.au_model = self._load_au_model(au_model_path)
        self.fer_model = self._load_fer_model(fer_model_path)
        self.affect_model = self._load_affect_model(affect_model_path)

        # 为AffectNet创建特征提取器
        self.affect_feature_extractor = SimpleFeatureExtractor().to(self.device)
        self.affect_feature_extractor.eval()

        # 定义图像预处理
        self.au_transform = self._get_au_transform()
        self.fer_transform = self._get_fer_transform()
        self.affect_transform = self._get_affect_transform()

        # 定义AU名称和表情标签
        self.au_names = ['AU1', 'AU2', 'AU4', 'AU5', 'AU6', 'AU7', 'AU9',
                         'AU12', 'AU14', 'AU15', 'AU17', 'AU20', 'AU23',
                         'AU24', 'AU25', 'AU26', 'AU27']

        self.emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy',
                               'Sad', 'Surprise', 'Neutral']

        print("\n所有模型加载完成!")
        print("=" * 60 + "\n")

    def _load_au_model(self, model_path: str) -> nn.Module:
        """加载AU识别模型"""
        print(f"[1/3] 加载AU识别模型: {model_path}")

        checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
        model = alexnet(pretrained=False)

        if 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
        else:
            model.load_state_dict(checkpoint)

        model.to(self.device)
        model.eval()
        print("    ✓ AU模型加载成功")
        return model

    def _load_fer_model(self, model_path: str) -> nn.Module:
        """加载FER表情分类模型"""
        print(f"[2/3] 加载FER表情分类模型: {model_path}")

        checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
        model = ResNet18(num_classes=7)

        if 'model_state_dict' in checkpoint:
            state_dict = checkpoint['model_state_dict']
        elif 'state_dict' in checkpoint:
            state_dict = checkpoint['state_dict']
        else:
            state_dict = checkpoint

        model.load_state_dict(state_dict)
        model.to(self.device)
        model.eval()
        print("    ✓ FER模型加载成功")
        return model

    def _load_affect_model(self, model_path: str) -> nn.Module:
        """加载AffectNet VA回归模型"""
        print(f"[3/3] 加载AffectNet VA模型: {model_path}")

        checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
        model = AffectNetModel(pretrained=False, use_attention=True)

        if 'model_state_dict' in checkpoint:
            state_dict = checkpoint['model_state_dict']
        elif 'state_dict' in checkpoint:
            state_dict = checkpoint['state_dict']
        else:
            state_dict = checkpoint

        model.load_state_dict(state_dict)
        model.to(self.device)
        model.eval()
        print("    ✓ AffectNet模型加载成功")
        return model

    def _get_au_transform(self):
        """AU模型的图像预处理"""
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])

    def _get_fer_transform(self):
        """FER模型的图像预处理(灰度图)"""
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.Grayscale(num_output_channels=1),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5], std=[0.5])
        ])

    def _get_affect_transform(self):
        """AffectNet模型的图像预处理"""
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])

    def predict(self, image_path: str, au_threshold: float = 0.5) -> Dict[str, Any]:
        """
        对单张图像进行完整的情感识别预测

        Args:
            image_path: 图像路径
            au_threshold: AU激活阈值

        Returns:
            包含所有预测结果的字典
        """
        # 读取图像
        image = Image.open(image_path).convert('RGB')

        # 1. AU识别预测
        au_input = self.au_transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            au_outputs = self.au_model(au_input)
            au_probs = torch.sigmoid(au_outputs).cpu().numpy().flatten()
            au_predictions = (au_probs > au_threshold).astype(int)

        # 整理AU结果
        au_results = {}
        active_aus = []
        for i, au_name in enumerate(self.au_names):
            au_results[au_name] = {
                'present': bool(au_predictions[i]),
                'confidence': float(au_probs[i])
            }
            if au_predictions[i]:
                active_aus.append(au_name)

        # 2. FER表情分类预测
        fer_input = self.fer_transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            fer_outputs = self.fer_model(fer_input)
            fer_probs = torch.softmax(fer_outputs, dim=-1).cpu().numpy().flatten()
            fer_pred = int(np.argmax(fer_probs))

        # 3. AffectNet VA预测
        affect_input = self.affect_transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            # 先提取特征
            affect_features = self.affect_feature_extractor(affect_input)  # [1, 512]
            # 再进行回归预测
            va_outputs = self.affect_model(affect_features)
            va_values = va_outputs.cpu().numpy().flatten()

        # 整合所有结果
        results = {
            'image': image_path,
            'AU_Recognition': {
                'active_AUs': active_aus,
                'total_active': len(active_aus),
                'detailed_results': au_results
            },
            'Emotion_Classification': {
                'predicted_emotion': self.emotion_labels[fer_pred],
                'emotion_index': fer_pred,
                'probabilities': {
                    label: float(prob)
                    for label, prob in zip(self.emotion_labels, fer_probs)
                },
                'confidence': float(fer_probs[fer_pred])
            },
            'Valence_Arousal': {
                'valence': float(va_values[0]),
                'arousal': float(va_values[1])
            }
        }

        return results

    def visualize_results(self, image_path: str, results: Dict[str, Any],
                          save_path: str = None):
        """可视化所有预测结果"""
        image = Image.open(image_path)

        fig = plt.figure(figsize=(18, 8))

        # 显示原图
        ax1 = plt.subplot(1, 3, 1)
        ax1.imshow(image)
        ax1.set_title('Input Image', fontsize=14, fontweight='bold')
        ax1.axis('off')

        # 显示AU结果
        ax2 = plt.subplot(1, 3, 2)
        ax2.axis('off')

        au_text = "═══ AU Recognition ═══\n\n"
        au_text += f"Active AUs: {results['AU_Recognition']['total_active']}\n\n"

        for au_name, au_info in results['AU_Recognition']['detailed_results'].items():
            status = "✓" if au_info['present'] else "✗"
            confidence = au_info['confidence']
            color = 'green' if au_info['present'] else 'gray'
            au_text += f"{status} {au_name}: {confidence:.3f}\n"

        ax2.text(0.05, 0.95, au_text, transform=ax2.transAxes,
                 fontsize=10, verticalalignment='top', fontfamily='monospace',
                 bbox=dict(boxstyle="round,pad=0.8", facecolor="lightblue", alpha=0.8))

        # 显示表情和VA结果
        ax3 = plt.subplot(1, 3, 3)
        ax3.axis('off')

        emotion = results['Emotion_Classification']['predicted_emotion']
        confidence = results['Emotion_Classification']['confidence']
        valence = results['Valence_Arousal']['valence']
        arousal = results['Valence_Arousal']['arousal']

        summary_text = "═══ Emotion Analysis ═══\n\n"
        summary_text += f"Predicted Emotion:\n  {emotion}\n"
        summary_text += f"  Confidence: {confidence:.3f}\n\n"

        summary_text += "Emotion Probabilities:\n"
        for label, prob in results['Emotion_Classification']['probabilities'].items():
            bar = "█" * int(prob * 20)
            summary_text += f"  {label:10s}: {bar} {prob:.3f}\n"

        summary_text += f"\n\nValence-Arousal:\n"
        summary_text += f"  Valence: {valence:+.3f}\n"
        summary_text += f"  Arousal: {arousal:+.3f}\n"

        ax3.text(0.05, 0.95, summary_text, transform=ax3.transAxes,
                 fontsize=10, verticalalignment='top', fontfamily='monospace',
                 bbox=dict(boxstyle="round,pad=0.8", facecolor="lightgreen", alpha=0.8))

        plt.tight_layout()

        if save_path:
            # 创建保存目录(如果不存在)
            import os
            save_dir = os.path.dirname(save_path)
            if save_dir and not os.path.exists(save_dir):
                os.makedirs(save_dir)
                print(f"\n创建目录: {save_dir}")

            plt.savefig(save_path, bbox_inches='tight', dpi=300, facecolor='white')
            print(f"可视化结果已保存至: {save_path}")

        plt.show()

    def print_results(self, results: Dict[str, Any]):
        """打印格式化的预测结果"""
        print("\n" + "=" * 80)
        print("多模态情感识别结果".center(80))
        print("=" * 80)

        # AU结果
        print("\n【1】 动作单元(AU)识别:")
        print("-" * 80)
        au_data = results['AU_Recognition']
        print(f"激活的AU: {', '.join(au_data['active_AUs']) if au_data['active_AUs'] else 'None'}")
        print(f"激活数量: {au_data['total_active']}/17")

        print("\n详细结果:")
        for au_name, au_info in au_data['detailed_results'].items():
            status = "✓ PRESENT" if au_info['present'] else "✗ ABSENT"
            print(f"  {au_name}: {status:12s} (confidence: {au_info['confidence']:.3f})")

        # 表情分类结果
        print("\n【2】 表情分类:")
        print("-" * 80)
        emotion_data = results['Emotion_Classification']
        print(f"预测表情: {emotion_data['predicted_emotion']}")
        print(f"置信度: {emotion_data['confidence']:.3f}")

        print("\n各表情概率:")
        for label, prob in emotion_data['probabilities'].items():
            bar = "█" * int(prob * 30)
            print(f"  {label:10s}: {bar:30s} {prob:.3f}")

        # VA结果
        print("\n【3】 情感维度(Valence-Arousal):")
        print("-" * 80)
        va_data = results['Valence_Arousal']
        print(f"Valence (愉悦度): {va_data['valence']:+.4f}")
        print(f"Arousal (激活度): {va_data['arousal']:+.4f}")

        print("\n" + "=" * 80 + "\n")


# ========== 使用示例 ==========
def main():
    # 初始化集成预测器
    predictor = IntegratedEmotionPredictor(
        au_model_path='models/alexnet_ensemble.pth',
        fer_model_path='models/best_checkpoint.tar',
        affect_model_path='models/AffectNet.pth',
        device='cuda'  # 如果没有GPU,使用'cpu'
    )

    # 测试图像路径
    image_path = "data/8.jpg"  # 替换为你的图像路径

    try:
        # 进行预测
        results = predictor.predict(image_path, au_threshold=0.5)

        # 打印结果
        predictor.print_results(results)

        # 可视化结果
        predictor.visualize_results(
            image_path,
            results,
            save_path="predict/integrated_result.png"
        )

    except Exception as e:
        print(f"\n预测过程中出错: {e}")
        print("请检查图像路径和模型文件是否正确")


if __name__ == "__main__":
    main()
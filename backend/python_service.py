from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import sys
import os

sys.path.append('/path/to/your/model')  # 添加你的模型路径

from three import IntegratedEmotionPredictor
from driving_state_inference import DrivingStateInference

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 52428800  # 50MB

# 初始化模型（在启动时只加载一次）
print("Initializing models...")
predictor = IntegratedEmotionPredictor(
    au_model_path='models/alexnet_ensemble.pth',
    fer_model_path='models/best_checkpoint.tar',
    affect_model_path='models/AffectNet.pth',
    device='cuda'
)
driving_state_engine = DrivingStateInference()


@app.route('/api/detect/image', methods=['POST'])
def detect_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # 保存临时文件
        filename = secure_filename(file.filename)
        filepath = os.path.join('/tmp', filename)
        file.save(filepath)

        # 运行检测
        results = predictor.predict(filepath, au_threshold=0.5)

        # 推断驾驶状态
        driving_state = driving_state_engine.infer_driving_state(results)

        # 组织返回数据
        response = {
            'emotion': results['Emotion_Classification']['predicted_emotion'],
            'emotion_confidence': float(results['Emotion_Classification']['confidence']),
            'valence': float(results['Valence_Arousal']['valence']),
            'arousal': float(results['Valence_Arousal']['arousal']),
            'active_aus': results['AU_Recognition']['active_AUs'],
            'driving_state': driving_state['driving_state'],
            'driving_state_confidence': float(driving_state['confidence']),
            'risk_level': driving_state['risk_level'],
            'risk_color': driving_state['risk_color'],
            'recommendation': driving_state['recommendation'],
            'details': driving_state['details']
        }

        # 清理临时文件
        os.remove(filepath)

        return jsonify(response)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
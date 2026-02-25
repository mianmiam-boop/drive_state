import os
import torch.nn as nn
import torch.utils.model_zoo as model_zoo
import torch

__all__ = ['AlexNet', 'alexnet']

# You need to download the model
model_urls = {
    'alexnet': 'https://download.pytorch.org/models/alexnet-owt-4df8aa71.pth',
}

model_name = r'alexnet-owt-4df8aa71.pth'


class AlexNet(nn.Module):

    def __init__(self, num_classes=256 * 6 * 6):
        super(AlexNet, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=11, stride=4, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Conv2d(64, 192, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Conv2d(192, 384, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(384, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
        )
        # self.classifier = nn.Sequential(
        #     nn.Dropout(),
        #     nn.Linear(256 * 6 * 6, 4096),
        #     nn.ReLU(inplace=True),
        #     nn.Dropout(),
        #     nn.Linear(4096, 4096),
        #     nn.ReLU(inplace=True),
        #     nn.Linear(4096, num_classes),
        # )

        # <editor-fold desc="17 basic classifiers">
        num1 = 1024
        num2 = 128
        self.classifier1 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier2 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier3 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier4 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier5 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier6 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier7 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier8 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier9 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier10 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier11 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier12 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier13 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier14 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier15 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier16 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        self.classifier17 = nn.Sequential(
            nn.Linear(num_classes, num1),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num1, num2),
            nn.Dropout(),
            nn.ReLU(inplace=True),
            nn.Linear(num2, 1),
            nn.Sigmoid()
        )
        # </editor-fold>

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), 256 * 6 * 6)
        # x = self.classifier(x)
        x1 = self.classifier1(x)
        x2 = self.classifier2(x)
        x3 = self.classifier3(x)
        x4 = self.classifier4(x)
        x5 = self.classifier5(x)
        x6 = self.classifier6(x)
        x7 = self.classifier7(x)
        x8 = self.classifier8(x)
        x9 = self.classifier9(x)
        x10 = self.classifier10(x)
        x11 = self.classifier11(x)
        x12 = self.classifier12(x)
        x13 = self.classifier13(x)
        x14 = self.classifier14(x)
        x15 = self.classifier15(x)
        x16 = self.classifier16(x)
        x17 = self.classifier17(x)
        return torch.cat((x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14, x15, x16, x17), 1)


def alexnet(pretrained=False, **kwargs):
    r"""AlexNet model architecture from the
    `"One weird trick..." <https://arxiv.org/abs/1404.5997>`_ paper.

    Args:
        pretrained (bool): If True, returns a model pre-trained on ImageNet
    """
    model = AlexNet(**kwargs)
    if pretrained:
        try:
            # 方法1: 尝试使用 torchvision 的预训练模型
            print("Loading AlexNet pretrained weights from torchvision...")
            from torchvision.models import alexnet as tv_alexnet
            tv_model = tv_alexnet(pretrained=True)

            # 复制特征提取层的权重
            model_dict = model.state_dict()
            pretrained_dict = tv_model.state_dict()

            # 过滤出可以加载的权重（只加载特征层）
            pretrained_dict = {k: v for k, v in pretrained_dict.items()
                               if k in model_dict and k.startswith('features')}

            # 更新模型字典
            model_dict.update(pretrained_dict)
            # 加载权重
            model.load_state_dict(model_dict)
            print("Successfully loaded pretrained weights from torchvision")

        except Exception as e:
            print(f"Warning: Could not load pretrained weights from torchvision: {e}")
            print("Using randomly initialized weights instead.")

            # 方法2: 如果 torchvision 失败，尝试从本地文件加载
            try:
                torch_home = os.path.expanduser(os.getenv('TORCH_HOME', '~/.torch'))
                model_dir = os.getenv('TORCH_MODEL_ZOO', os.path.join(torch_home, 'models'))
                model_path = os.path.join(model_dir, model_name)

                if os.path.exists(model_path):
                    print(f"Loading pretrained weights from local file: {model_path}")
                    model_param = torch.load(model_path)

                    model_dict = model.state_dict()
                    pretrained_dict = {k: v for k, v in model_param.items()
                                       if k in model_dict and k.startswith('features')}

                    model_dict.update(pretrained_dict)
                    model.load_state_dict(model_dict)
                    print("Successfully loaded pretrained weights from local file")
                else:
                    print("Local pretrained weights file not found, using random initialization")

            except Exception as e2:
                print(f"Warning: Could not load pretrained weights from local file: {e2}")
                print("Using randomly initialized weights")

    return model
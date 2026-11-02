import tensorflow as tf
from keras import layers, models
from keras.applications import EfficientNetB4
from keras.optimizers import AdamW
from keras.utils import get_file
import numpy as np
import os

class PestDetectionModel:
    def __init__(self, num_classes, input_shape=(380, 380, 3)):  # EfficientNetB4 optimal input size
        self.num_classes = num_classes
        self.input_shape = input_shape
        self.model = self._build_model()
        
    def _build_model(self):
        """Build EfficientNetB4 model with advanced architecture"""
        # Base EfficientNetB4 model with higher capacity
        base_model = EfficientNetB4(
            include_top=False,
            weights=None,  # Initialize without weights first
            input_shape=self.input_shape
        )
        # Now load imagenet weights
        weights_path = get_file(
            'efficientnetb4_notop.h5',
            'https://storage.googleapis.com/keras-applications/efficientnetb4_notop.h5',
            cache_subdir='models',
            file_hash='2fb262d3c1a21f156008c5c175d9cb51'
        )
        base_model.load_weights(weights_path)
        
        # Freeze base model initially
        base_model.trainable = False
        
        # Input layer with preprocessing
        inputs = layers.Input(shape=self.input_shape)
        
        # Preprocessing layers
        x = layers.Rescaling(1./255)(inputs)
        x = layers.Normalization(
            mean=[0.485, 0.456, 0.406],
            variance=[0.229**2, 0.224**2, 0.225**2]
        )(x)
        
        # Base model
        x = base_model(x, training=False)
        
        # Global pooling and dropout
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.5)(x)
        
        # Dense layers with residual connections
        for units in [1024, 512]:
            residual = x
            x = layers.Dense(units)(x)
            x = layers.BatchNormalization()(x)
            x = layers.Activation('swish')(x)
            if x.shape[-1] == residual.shape[-1]:
                x = layers.Add()([x, residual])
            x = layers.Dropout(0.3)(x)
        
        # Output layer
        outputs = layers.Dense(self.num_classes, activation='softmax')(x)
        
        # Create model
        model = models.Model(inputs, outputs)
        
        return model
    
    def compile_model(self, learning_rate=1e-3):
        """Compile model with AdamW optimizer"""
        optimizer = AdamW(
            learning_rate=learning_rate,
            weight_decay=0.0001,
            beta_1=0.9,
            beta_2=0.999,
            epsilon=1e-8
        )
        
        self.model.compile(
            optimizer=optimizer,
            loss='sparse_categorical_crossentropy',
            metrics=[
                'accuracy',
                tf.keras.metrics.SparseTopKCategoricalAccuracy(k=3, name='top3_acc'),
                tf.keras.metrics.SparseTopKCategoricalAccuracy(k=5, name='top5_acc')
            ]
        )
    
    def unfreeze_and_compile(self, learning_rate=1e-4, unfreeze_from=-50):
        """Unfreeze top layers of EfficientNetB4 for fine-tuning"""
        base = self.model.get_layer('efficientnetb4')
        base.trainable = True
        # Keep bottom layers frozen, only fine-tune the top portion
        for layer in base.layers[:unfreeze_from]:
            layer.trainable = False

        # Recompile with lower learning rate
        self.compile_model(learning_rate=learning_rate)
    
    def get_augmentation_pipeline(self, strong=False):
        """Create enhanced data augmentation pipeline"""
        if strong:
            return tf.keras.Sequential([
                # Geometric transformations
                layers.RandomRotation(0.4, fill_mode='reflect'),
                layers.RandomTranslation(0.3, 0.3, fill_mode='reflect'),
                layers.RandomFlip("horizontal_and_vertical"),
                layers.RandomZoom(0.3, fill_mode='reflect'),
                
                # Color transformations
                layers.RandomContrast(0.3),
                layers.RandomBrightness(0.3),
                layers.GaussianNoise(0.15),
                
                # Advanced augmentations
                layers.RandomCrop(*self.input_shape[:2]),
                tf.keras.layers.experimental.preprocessing.RandomCutout(
                    height_factor=0.2, width_factor=0.2
                ),
                
                # Ensure output shape
                layers.Resizing(*self.input_shape[:2])
            ])
        else:
            return tf.keras.Sequential([
                # Basic augmentations
                layers.RandomRotation(0.2, fill_mode='reflect'),
                layers.RandomFlip("horizontal"),
                layers.RandomZoom(0.2, fill_mode='reflect'),
                layers.RandomBrightness(0.2),
                layers.RandomContrast(0.1),
                
                # Ensure output shape
                layers.Resizing(*self.input_shape[:2])
            ])

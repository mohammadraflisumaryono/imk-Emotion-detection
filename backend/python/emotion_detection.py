# emotion_detection.py
import cv2
import numpy as np
from tensorflow.keras.models import model_from_json
from tensorflow.keras.preprocessing.image import img_to_array
import os
import sys
import logging
import base64
from datetime import datetime

class EmotionDetector:
    def __init__(self):
        self.emotions = {
            0: "Angry",
            1: "Disgust",
            2: "Fear",
            3: "Happy",
            4: "Neutral",
            5: "Sad",
            6: "Surprised"
        }
        self.setup_logging()
        self.load_model()
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )

    def setup_logging(self):
        log_dir = 'logs'
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(os.path.join(log_dir, 'emotion_detection.log')),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('EmotionDetector')

    def load_model(self):
        try:
            # Load model architecture
            model_json_path = os.path.join('model', 'emotion_model.json')
            with open(model_json_path, 'r') as json_file:
                loaded_model_json = json_file.read()
            self.model = model_from_json(loaded_model_json)

            # Load weights
            model_weights_path = os.path.join('model', 'emotion_model.h5')
            self.model.load_weights(model_weights_path)
            self.logger.info("Model loaded successfully")
        except Exception as e:
            self.logger.error(f"Failed to load model: {str(e)}")
            raise

    def preprocess_face(self, face_img):
        """Preprocess detected face for emotion prediction"""
        face_img = cv2.resize(face_img, (48, 48))
        face_img = face_img.astype("float") / 255.0
        face_img = img_to_array(face_img)
        face_img = np.expand_dims(face_img, axis=0)
        return face_img

    def detect_emotion(self, image):
        """Detect emotion from image"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            self.logger.debug(f"Detected {len(faces)} faces")
            
            results = []
            for (x, y, w, h) in faces:
                # Extract face ROI
                roi = gray[y:y + h, x:x + w]
                
                # Preprocess face
                processed_roi = self.preprocess_face(roi)
                
                # Predict emotion
                prediction = self.model.predict(processed_roi)
                emotion_idx = np.argmax(prediction[0])
                emotion = self.emotions[emotion_idx]
                confidence = float(prediction[0][emotion_idx])
                
                results.append({
                    'emotion': emotion,
                    'confidence': confidence,
                    'bbox': [int(x), int(y), int(w), int(h)]
                })
                
                self.logger.debug(f"Detected emotion: {emotion} with confidence: {confidence:.2f}")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error in emotion detection: {str(e)}")
            raise

    def process_base64_image(self, base64_string):
        """Process base64 encoded image"""
        try:
            # Remove data:image/jpeg;base64, prefix if present
            if 'base64,' in base64_string:
                base64_string = base64_string.split('base64,')[1]
            
            # Decode base64 string
            img_data = base64.b64decode(base64_string)
            np_arr = np.frombuffer(img_data, np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            return self.detect_emotion(image)
            
        except Exception as e:
            self.logger.error(f"Error processing base64 image: {str(e)}")
            raise

    def process_image_file(self, image_path):
        """Process image from file"""
        try:
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Failed to load image: {image_path}")
            return self.detect_emotion(image)
        except Exception as e:
            self.logger.error(f"Error processing image file: {str(e)}")
            raise

if __name__ == "__main__":
    detector = EmotionDetector()
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        results = detector.process_image_file(image_path)
        print(results)
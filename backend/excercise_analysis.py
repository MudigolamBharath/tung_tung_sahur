import numpy as np
import mediapipe as mp
import pickle
from ultralytics import YOLO
import os
import logging
import warnings
from sklearn.exceptions import InconsistentVersionWarning

# Suppress scikit-learn version warnings
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)
print("Pose model loaded successfully:", pose)

# Get the absolute path to the Models directory
models_dir = os.path.join(os.path.dirname(__file__), "Models")

#Loading Models
# Load model
with open(os.path.join(models_dir, "bicep", "KNN_model.pkl"), "rb") as f:
    bicep_model = pickle.load(f)
with open(os.path.join(models_dir, "plank", "LR_model.pkl"), "rb") as f:
    plank_model = pickle.load(f)
with open(os.path.join(models_dir, "pushup", "RF_model.pkl"), "rb") as f:
    pushup_model = pickle.load(f)
with open(os.path.join(models_dir, "squat", "LR_model.pkl"), "rb") as f:
    count_model = pickle.load(f)
pose_model = YOLO(os.path.join(models_dir, "Excercise_Model.pt"))

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
    
    return angle

def feedback_and_count(exercise, landmarks, counter):
    errors = []
    if "state" not in counter:
        counter["state"] = False
    if "count" not in counter:
        counter["count"] = 0
    if "difficulty" not in counter:
        counter["difficulty"] = "beginner"  # Can be 'beginner', 'intermediate', 'advanced'

    # Define angle thresholds based on difficulty level
    thresholds = {
        "beginner": {
            "alignment_tolerance": 25,
            "pushup_top": 150,  # More lenient top position
            "pushup_bottom": 100,  # Higher bottom position
            "squat_depth": 100,  # Less deep squat required
            "squat_top": 160,  # More lenient top position
            "curl_top": 150,  # More lenient top position
            "curl_bottom": 70,  # Higher bottom position
            "pullup_arms": 150,  # More lenient arm extension
            "plank_alignment": 25  # More forgiving alignment
        },
        "intermediate": {
            "alignment_tolerance": 20,
            "pushup_top": 155,
            "pushup_bottom": 95,
            "squat_depth": 95,
            "squat_top": 165,
            "curl_top": 155,
            "curl_bottom": 65,
            "pullup_arms": 155,
            "plank_alignment": 20
        },
        "advanced": {
            "alignment_tolerance": 15,
            "pushup_top": 160,
            "pushup_bottom": 90,
            "squat_depth": 90,
            "squat_top": 170,
            "curl_top": 160,
            "curl_bottom": 60,
            "pullup_arms": 160,
            "plank_alignment": 15
        }
    }

    current_thresholds = thresholds[counter["difficulty"]]

    if exercise == "Push-ups":
        # Body alignment check
        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]
        alignment_angle = calculate_angle(shoulder, hip, ankle)
        
        # Elbow angle check
        left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
        left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y]
        left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST].y]
        elbow_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)

        # Form validation with adjusted thresholds
        if abs(180 - alignment_angle) > current_thresholds["alignment_tolerance"]:
            errors.append("Try to keep your body straighter. It's okay to start with knee push-ups!")
        
        if elbow_angle > current_thresholds["pushup_top"] and not counter["state"]:
            counter["state"] = True
        if elbow_angle <= current_thresholds["pushup_bottom"] and counter["state"]:
            counter["count"] += 1
            counter["state"] = False
        
        if elbow_angle > current_thresholds["pushup_bottom"] and counter["state"]:
            errors.append("Try to go a little lower if you can. Remember, any depth is better than none!")

    elif exercise == "Squats":
        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
        knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y]
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]
        knee_angle = calculate_angle(hip, knee, ankle)
        
        knee_x = landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x
        toe_x = landmarks[mp_pose.PoseLandmark.LEFT_FOOT_INDEX].x
        
        if knee_angle < current_thresholds["squat_depth"] and not counter["state"]:
            counter["state"] = True
        if knee_angle > current_thresholds["squat_top"] and counter["state"]:
            counter["count"] += 1
            counter["state"] = False
        
        if knee_angle > current_thresholds["squat_depth"]:
            errors.append("Lower yourself comfortably. Remember to keep your back straight!")
        if knee_x > toe_x + 0.1:  # More lenient knee position check
            errors.append("Try to keep your knees from going too far forward.")

    elif exercise == "Curls":
        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y]
        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST].y]
        curl_angle = calculate_angle(shoulder, elbow, wrist)
        
        initial_elbow_x = elbow[0]
        current_elbow_x = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].x
        
        if curl_angle > current_thresholds["curl_top"] and not counter["state"]:
            counter["state"] = True
            initial_elbow_x = current_elbow_x
        if curl_angle < current_thresholds["curl_bottom"] and counter["state"]:
            counter["count"] += 1
            counter["state"] = False
        
        if abs(current_elbow_x - initial_elbow_x) > 0.15:  # More lenient elbow position
            errors.append("Try to keep your upper arm steady.")

    elif exercise == "Pull-ups":
        chin = [landmarks[mp_pose.PoseLandmark.NOSE].y]
        bar_level = 0.1
        
        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y]
        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST].y]
        arm_angle = calculate_angle(shoulder, elbow, wrist)
        
        if arm_angle > current_thresholds["pullup_arms"] and not counter["state"]:
            counter["state"] = True
        if chin[0] <= bar_level + 0.05 and counter["state"]:  # More lenient chin position
            counter["count"] += 1
            counter["state"] = False

    elif exercise == "Plank":
        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]
        alignment_angle = calculate_angle(shoulder, hip, ankle)
        
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y]
        shoulder_x = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x
        
        if abs(180 - alignment_angle) > current_thresholds["plank_alignment"]:
            errors.append("Focus on keeping your body as straight as you can.")
        if abs(elbow[0] - shoulder_x) > 0.15:  # More lenient elbow position
            errors.append("Try to keep your elbows under your shoulders.")

    return errors, counter
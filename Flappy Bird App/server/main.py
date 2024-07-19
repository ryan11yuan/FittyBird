import cv2
import mediapipe as mp
import asyncio
import websockets

# Initialize MediaPipe Pose.
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

# Open webcam.
cap = cv2.VideoCapture(0)

async def detect_jump(websocket, path):
    flag = 1
    
    while True:
        # Read frame from webcam.
        ret, frame = cap.read()

        if not ret:
            break

        # Recolor image to RGB.
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False

        # Make detection.
        results = pose.process(image)

        try:
            landmarks = results.pose_landmarks.landmark

            # Get coordinates.
            left_shoulder_y = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y
            right_shoulder_y = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y
            left_elbow_y = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y
            right_elbow_y = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y

            # Jumping jack detection logic.
            if left_elbow_y < (left_shoulder_y + 0.2) and right_elbow_y < (right_shoulder_y + 0.2):
                if flag == 1:
                    await websocket.send("JUMP")
                    print("sent")
                    flag = 0
            else:
                if flag == 0:
                    await websocket.send("NOT JUMP")
                    print("sent")
                    flag = 1

        except Exception as e:
            print(f"Error: {e}")

        # Delay for 1 second before processing the next frame.
        await asyncio.sleep(0.01)

    cap.release()

async def main():
    async with websockets.serve(detect_jump, "localhost", 8765):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
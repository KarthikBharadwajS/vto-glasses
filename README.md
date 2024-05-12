# VTO [aka Virtual Try On]

## Overview

VTO is a web application that allows users to virtually try on different glasses using their webcam in real-time.

## How It Works

1. **Facial Detection:** TensorFlow detects the user's face and key facial landmarks in real-time through the webcam.
2. **Frame Fitting:** Based on the detected landmarks, Three.js adjusts the 3D model of the glasses to align with the user's eyes and nose.
3. **Rendering:** The fitted frames are then rendered over the user's face on the video feed, allowing for a virtual try-on experience.

### Prerequisites

- Node.js
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KarthikBharadwajS/vto-glasses.git
   ```
2. Navigate the project repo
3. Install necessary packages
   ```bash
   npm install
   ```
4. Running the application
   ```bash
    npm run dev
   ```

### Acknowledgments

- [Threejs](https://threejs.org/)
- [Tensorflow](https://www.tensorflow.org/js)

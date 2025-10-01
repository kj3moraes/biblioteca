from ultralytics import YOLO
import wandb

wandb.init(
    project="yolo-book-training",
    name="yolov8-book-training-1",
    config={
        "epochs": 50,
        "batch_size": 16,
        "img_size": 800,
        "model": "yolov8s"
    }
)

# Load a pretrained YOLOv9 model
model = YOLO("./models/yolov8s.pt")
model_path = "./models/yolov8s_finetunedv2.pt"
# Train the model on your dataset
results = model.train(
    data="./data/data.yaml",
    epochs=20,
    imgsz=800,
    project="yolo-book-training",  # wandb project name
    name="yolov8_finetune",        # wandb run name
    device="mps"
)


# Save the fine-tuned model
model.save(model_path)

wandb.log_model(model_path)
wandb.finish()

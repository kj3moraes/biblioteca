from segment_anything import build_sam, sam_model_registry, SamPredictor

sam_checkpoint = "model/sam_vit_h_4b8939.pth"
model_type = "vit_h"
device = "mps" if torch.backends.mps.is_available() else "cpu"
sam = sam_model_registry[model_type](checkpoint=sam_checkpoint).to(device)

predictor = SamPredictor(sam)

image = cv2.imread("img/image.png")
predictor.set_image(image)

predictions = predictor.predict(
    point_coords=None,
    point_labels=None,
    box=None,
    multimask_output=False,
)

print(predictions)
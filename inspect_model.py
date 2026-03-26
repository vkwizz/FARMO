import onnxruntime as ort
try:
    sess = ort.InferenceSession("d:/FARMO/farmo-mobile/assets/rubber_disease_model.onnx")
    for input in sess.get_inputs():
        print(f"Input: {input.name}, Shape: {input.shape}, Type: {input.type}")
    for output in sess.get_outputs():
        print(f"Output: {output.name}, Shape: {output.shape}, Type: {output.type}")
except Exception as e:
    print(f"Error: {e}")

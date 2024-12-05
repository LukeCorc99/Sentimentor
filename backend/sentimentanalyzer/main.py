from transformers import pipeline

# Use a Hugging Face pipeline as it abstracts a lot of the complexity of NLP tasks. This pipeline will use a model for sentiment analysis.
classifier = pipeline("sentiment-analysis")

res = classifier("I love you")

print(res)

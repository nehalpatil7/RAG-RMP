import os
import json
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
load_dotenv()


# Initialize Pinecone and OpenAI
if not os.getenv("OPENROUTER_API_KEY") or not os.getenv("PINECONE_API_KEY"):
    raise Exception("API keys not set for PineCone/OpenAI.")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
openai = OpenAI(
    base_url=os.getenv("NEXT_PUBLIC_OPENROUTER_ENDPOINT"),
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# Create a Pinecone index
existing_indexes = pc.list_indexes()
if "rag" not in str(existing_indexes):
    pc.create_index(
        name="rag",
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
else:
    print("Index already present.")

data = json.load(open("reviews.json"))
processed_data = []
# Create embeddings for each review
for review in data["reviews"]:
    response = openai.embeddings.create(
        input=review["review"], model="text-embedding-3-small"
    )
    embedding = response.data[0].embedding
    processed_data.append(
        {
            "values": embedding,
            "id": review["professor"],
            "metadata": {
                "review": review["review"],
                "subject": review["subject"],
                "stars": review["stars"],
            },
        }
    )

# Insert embeddings into the index
index = pc.Index("rag")
upsert_response = index.upsert(
    vectors=processed_data,
    namespace="ns1",
)
print(f"Upserted count: {upsert_response['upserted_count']}")
print(index.describe_index_stats())

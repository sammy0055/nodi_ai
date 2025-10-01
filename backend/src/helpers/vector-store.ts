import { QdrantClient } from '@qdrant/js-client-rest';
import { generateEmbedding } from './vector-embedding';
import { IProduct } from '../types/product';
import { IArea } from '../types/area';

export class ManageVectorStore {
  protected qdrant: QdrantClient;
  protected collectionName = 'embedding';

  constructor() {
    this.qdrant = new QdrantClient({
      url: 'http://localhost:6333', // Qdrant container endpoint
    });
  }

  // ✅ Ensure collection exists (call this at app startup)
  async initCollection() {
    const exists = await this.qdrant.getCollection(this.collectionName).catch(() => null);

    if (!exists) {
      await this.qdrant.createCollection(this.collectionName, {
        vectors: {
          size: 1536, // dimension of OpenAI embeddings
          distance: 'Cosine', // best for natural language similarity
        },
      });
      console.log(`✅ Collection "${this.collectionName}" created`);
    } else {
      console.log(`ℹ️ Collection "${this.collectionName}" already exists`);
    }
  }

  // ✅ Insert or update a product embedding
  async insertProductEmbedding(product: Pick<IProduct, 'id' | 'name' | 'description' | 'currency'>) {
    const text = `${product.name} ${product.description} Price: ${product.currency}`;
    const embedding = await generateEmbedding(text);

    await this.qdrant.upsert(this.collectionName, {
      wait: true,
      points: [
        {
          id: product.id,
          vector: embedding,
          payload: product,
        },
      ],
    });

    console.log(`🔄 Product ${product.id} embedding upserted`);
  }

  // ✅ Search similar products by natural language query
  async searchProducts(query: string, limit = 5) {
    const embedding = await generateEmbedding(query);

    const results = await this.qdrant.search(this.collectionName, {
      vector: embedding,
      limit,
    });

    return results.map((r) => ({
      score: r.score,
      product: r.payload,
    }));
  }

  async insertAreaEmbedding(
    area: Pick<IArea, 'id' | 'name' | 'deliveryCharge' | 'deliveryTime' | 'branchId' | 'zoneId'>
  ) {
    const { id, name, deliveryCharge, deliveryTime } = area;
    const text = `areaName:${name}, deliveryCharge:${deliveryCharge}, deliveryTime:${deliveryTime}`;
    const embedding = await generateEmbedding(text);
    await this.qdrant.upsert(this.collectionName, {
      wait: true,
      points: [
        {
          id: id,
          vector: embedding,
          payload: area,
        },
      ],
    });

    console.log(`🔄 Areas ${id} embedding upserted`);
  }

  async searchAreas(query: string, limit = 5) {
    const embedding = await generateEmbedding(query);
    const results = await this.qdrant.search(this.collectionName, {
      vector: embedding,
      limit,
    });

    return results.map((r) => ({
      score: r.score,
      product: r.payload,
    }));
  }
}

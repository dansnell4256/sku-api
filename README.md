# SKU Management API

A Node.js TypeScript API for managing Stock Keeping Unit (SKU) identifiers with local file storage.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install uuid for generating unique IDs:
```bash
npm install uuid @types/uuid
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

For development (with auto-reload):
```bash
npm run dev
```

## API Endpoints

### Create SKU
```
POST http://localhost:3000/api/skus
Content-Type: application/json

{
    "sku": "berliner",
    "description": "Jelly donut",
    "price": "2.99"
}
```

### Update SKU
```
POST http://localhost:3000/api/skus?id={sku-id}
Content-Type: application/json

{
    "sku": "berliner",
    "description": "Updated Jelly donut",
    "price": "3.49"
}
```

### Get All SKUs
```
GET http://localhost:3000/api/skus
```

### Get SKU by ID
```
GET http://localhost:3000/api/skus/{id}
```

### Delete SKU
```
DELETE http://localhost:3000/api/skus/{id}
```

## Data Storage

SKUs are stored in `./data/skus.json` file. The directory and file are created automatically when the API starts.

## Example Usage

1. Create a SKU:
```bash
curl -X POST http://localhost:3000/api/skus \
  -H "Content-Type: application/json" \
  -d '{"sku":"berliner","description":"Jelly donut","price":"2.99"}'
```

2. Get all SKUs:
```bash
curl http://localhost:3000/api/skus
```

3. Get specific SKU:
```bash
curl http://localhost:3000/api/skus/{id}
```

4. Update SKU:
```bash
curl -X POST "http://localhost:3000/api/skus?id={sku-id}" \
  -H "Content-Type: application/json" \
  -d '{"sku":"berliner","description":"Updated Jelly donut","price":"3.49"}'
```

5. Delete SKU:
```bash
curl -X DELETE http://localhost:3000/api/skus/{id}
```
FROM node:20-bookworm-slim

# Install Python 3, pip, and virtual environment
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Setup Python virtualenv
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install Node dependencies
COPY package*.json bun.lock* ./
RUN npm install

# Copy application source
COPY . .

# Build frontend production assets
RUN npm run build

# Default environment configuration
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start unified Node + FastAPI service
CMD ["npm", "start"]

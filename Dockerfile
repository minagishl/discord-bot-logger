# Use the official Bun runtime as a parent image
FROM oven/bun:1-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and bun.lock to the container
COPY package.json bun.lock ./

# Install app dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code to the container
COPY . .

# Building the app
RUN bun run build

# Expose port 3000 for the app to listen on
EXPOSE 3000

# Start the app
CMD ["bun", "run", "start"]

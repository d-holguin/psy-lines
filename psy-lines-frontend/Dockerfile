# ----------------------------
# Build from source
# ----------------------------
FROM node:18 AS build

WORKDIR /usr/local/app

# Step 1: Copy package files and install dependencies
COPY package*.json .
RUN npm install

# Step 2: Copy the rest of your application's source files
COPY . .
RUN npm run build

# ----------------------------
# Run with Nginx
# ----------------------------
FROM nginx:latest

# Step 3: Copy the built application files from the build stage
COPY --from=build /usr/local/app/dist/psy-lines-frontend /usr/share/nginx/html

# Step 4: Copy the nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Step 5: Expose port 8080
EXPOSE 8080

# Step 6: Start Nginx
CMD ["nginx", "-g", "daemon off;"]

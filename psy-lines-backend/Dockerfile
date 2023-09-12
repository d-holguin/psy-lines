FROM rust:1.71 as builder

WORKDIR /usr/src/psy-lines-backend

COPY . .

RUN cargo build --release

FROM debian:bullseye-slim

EXPOSE 8080

RUN apt-get update \
    && apt-get install -y ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/psy-lines-backend/target/release/psy-lines-backend /usr/local/bin/psy-lines-backend


CMD ["psy-lines-backend"]
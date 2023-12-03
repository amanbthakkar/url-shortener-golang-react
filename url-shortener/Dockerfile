FROM golang:alpine

WORKDIR /app

# Copy only go.mod and go.sum to leverage Docker layer caching
COPY go.mod .
COPY go.sum .

# Download dependencies only if the go.mod or go.sum files have changed
RUN go mod download

COPY . .

RUN go build -o main .

CMD ["./main"]

#!/bin/sh
for i in $(seq 1 1000); do
  amount=$(awk -v min=10 -v max=100 'BEGIN{srand(); printf "%.2f", min+rand()*(max-min)}')
  correlationId=$(uuidgen)
  curl --location 'http://192.168.1.126:9999/payments' \
    --header 'Content-Type: application/json' \
    --data "{
      \"amount\": $amount,
      \"correlationId\": \"$correlationId\"
    }"
  echo
done
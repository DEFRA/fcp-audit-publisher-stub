#!/usr/bin/env sh

echo "configuring sqs and sns"
echo "==================="
AWS_REGION=eu-west-2

echo "Waiting for floci..."
until aws sqs list-queues > /dev/null 2>&1; do
  sleep 1
done
echo "floci is ready"

create_topic() {
  local TOPIC_NAME_TO_CREATE=$1
  aws sns create-topic --name ${TOPIC_NAME_TO_CREATE} --region ${AWS_REGION}
}

create_topic "fcp_audit_publisher_stub"

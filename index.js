const AWS = require("aws-sdk");
const response = require("cfn-response");
const apigateway = new AWS.APIGateway();
function verifyRequired(fieldName, value) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  throw new Error(`the field ${fieldName} is required`);
}
async function handler(event, context) {
  console.log("RequestType : ", event.RequestType);
  if (event.RequestType == "Delete") {
    //Nothing to do
    response.send(event, context, response.SUCCESS);
    return;
  }
  try {
    const restApiId = verifyRequired("RestApiId", event.ResourceProperties.RestApiId);
    const stageName = verifyRequired("StageName", event.ResourceProperties.StageName);
    const description = verifyRequired("Description", event.ResourceProperties.Description);

    const params = {
      restApiId: restApiId,
      stageName: stageName,
      stageDescription: description,
      description: description,
    };

    const variables = event.ResourceProperties.Variables;
    if (variables) {
      params["variables"] = variables;
    }

    console.log("Params : " + JSON.stringify(params));

    apigateway.createDeployment(params, (err, data) => {
      if (err) {
        console.log("Deployment failed.");
        console.log(err);
        response.send(event, context, response.FAILED, err);
      } else {
        console.log("Deployment succeeded. StageId :", data.id);
        response.send(event, context, response.SUCCESS, { state: "success" });
      }
    });
  } catch (e) {
    console.log("Deployment failed.");
    console.log(e);
    response.send(event, context, response.FAILED, e);
  }
}

exports.handler = handler;

const args = {
  RequestType: "Create",
  ResourceProperties: {
    RestApiId: "x1hvjdeeph",
    StageName: "demo",
    Description: "Description Demo",
    Variables: {
      vpcId: "1234",
      url: "http://localhost",
    },
  },
};

handler(args);

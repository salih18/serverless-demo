import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";

import { GraphQLClient } from "graphql-request";

// export const hello: APIGatewayProxyHandler = async (
//   _event: APIGatewayProxyEvent
// ): Promise<APIGatewayProxyResult> => {
//   try {
//     const response = {
//       statusCode: 200,
//       body: "Heelo",
//     };
//     return response;
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: "An error occured",
//     };
//   }
// };

export const calculate: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const requestBody = event.body;
    const parsedBody = JSON.parse(requestBody || "");

    const endpoint = "https://api.spacex.land/graphql/";

    const graphQLClient = new GraphQLClient(endpoint);

    const variables = {
      id: parsedBody?.id,
    };

    const query = /* GraphQL */ `
      query getLaunch($id: ID!) {
        launch(id: $id) {
          id
          mission_name
          launch_date_local
          launch_success
          details
          rocket {
            rocket {
              mass {
                kg
              }
              first_stage {
                fuel_amount_tons
              }
            }
            rocket_name
          }
          links {
            article_link
            flickr_images
          }
        }
      }
    `;

    interface TData {
      launch: {
        id: string;
        mission_name: string;
        launch_date_local: string;
        launch_success: boolean;
        details: string;
        rocket: {
          rocket: {
            mass: {
              kg: number;
            };
            first_stage: {
              fuel_amount_tons: number;
            };
          };
          rocket_name: string;
        };
        links: {
          article_link: string;
          flickr_images: string[];
        };
      };
    }

    const data = await graphQLClient.request<TData>(query, variables);
    // console.log(JSON.stringify(data, undefined, 2));
    const response = {
      statusCode: 200,
      body: JSON.stringify(data, undefined, 2),
    };
    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: "An error occured",
    };
  }
};

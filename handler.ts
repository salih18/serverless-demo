import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";

import { GraphQLClient } from "graphql-request";

export const calculate: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const requestBody = event.body;
    const parsedBody = JSON.parse(requestBody || "");
    console.log("🚀 ~ file: handler.ts ~ line 15 ~ parsedBody", parsedBody);

    const endpoint = "https://api.spacex.land/graphql/";

    const graphQLClient = new GraphQLClient(endpoint);

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

    const promises = parsedBody.ids.map(async (id) => {
      return await graphQLClient.request<TData>(query, {
        id,
      });
    });

    const results = await Promise.allSettled<PromiseSettledResult<any>>(
      promises
    );

    const launches = results.map((l: any) => {
      if (l.status === "fulfilled") {
        return l.value.launch;
      }
    });

    const totalMass = launches.reduce((sum, launch) => {
      sum =
        sum +
        launch?.rocket?.rocket?.mass?.kg +
        launch?.rocket?.rocket?.first_stage?.fuel_amount_tons;
      return sum;
    }, 0);

    const totalConsumption = 1 * 15 * totalMass * 1.35 * 10;

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ totalConsumption }, undefined, 2),
    };
    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: "An error occured",
    };
  }
};

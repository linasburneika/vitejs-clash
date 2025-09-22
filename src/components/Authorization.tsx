/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";

export enum AuthorizationState {
  Pending,
  Authorized,
}

export interface AuthorizationContext {
  client: BrowserAuthorizationClient;
  state: AuthorizationState;
}

const authorizationContext = createContext<AuthorizationContext>({
  client: new BrowserAuthorizationClient({
    clientId: "",
    redirectUri: "",
    scope: "",
  }),
  state: AuthorizationState.Pending,
});

export function useAuthorizationContext() {
  return useContext(authorizationContext);
}

const createAuthClient = (): AuthorizationContext => {
  const client = new BrowserAuthorizationClient({
    scope: import.meta.env.IMJS_AUTH_CLIENT_SCOPES ?? "",
    clientId: import.meta.env.IMJS_AUTH_CLIENT_CLIENT_ID ?? "",
    redirectUri: import.meta.env.IMJS_AUTH_CLIENT_REDIRECT_URI ?? "",
    postSignoutRedirectUri: import.meta.env.IMJS_AUTH_CLIENT_LOGOUT_URI,
    responseType: "code",
    authority: import.meta.env.IMJS_AUTH_AUTHORITY,
  });
  client.getAccessToken = async () => Promise.resolve("Basic eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpVHdpbklkIjoiZmU1YTA2YzUtY2U3NC00OWM1LTgyZTMtM2ViMjBmNWRjMTEzIiwiaWQiOiIyZGUwZWZmZi1lZmVkLTQzYWEtYWUwNC0zMmVlYWU2MDFkMDUiLCJleHAiOjE3OTAxMDIwMjl9.igZQS6XTHD_ep_yC9R1VxdC30V8rPKkstH89sjTrpbA");
  return {
    client,
    state: AuthorizationState.Authorized,
  };
};

export function AuthorizationProvider(props: PropsWithChildren<unknown>) {
  const [contextValue] = useState<AuthorizationContext>(() =>
    createAuthClient()
  );

  return (
    <authorizationContext.Provider value={contextValue}>
      {props.children}
    </authorizationContext.Provider>
  );
}

export function SignInRedirect() {
  const { client } = useAuthorizationContext();

  useEffect(() => {
    void client.handleSigninCallback();
  }, [client]);

  return <></>;
}

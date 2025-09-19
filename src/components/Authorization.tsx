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
  return {
    client,
    state: AuthorizationState.Pending,
  };
};

export function AuthorizationProvider(props: PropsWithChildren<unknown>) {
  const [contextValue, setContextValue] = useState<AuthorizationContext>(() =>
    createAuthClient()
  );
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    fetch("https://connect-itwinjscodesandbox.bentley.com/api/userToken").then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
      }
      return response.json();
    }).then((data) => {
      setContextValue((prev) => ({
        ...prev,
        state: AuthorizationState.Authorized,
      }));

      setToken(data._jwt)
    }).catch(() => {
      // Handle token fetch error silently or use proper error reporting
      setToken(undefined);
    });
  }, []);

  contextValue.client.getAccessToken = async () => Promise.resolve(`bearer ${token}`);

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

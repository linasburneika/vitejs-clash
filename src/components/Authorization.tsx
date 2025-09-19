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
  client.getAccessToken = async () => {
    return Promise.resolve("bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkJlbnRsZXlJTVNfMjAyNSIsInBpLmF0bSI6ImE4bWUifQ.eyJzY29wZSI6WyJpdHdpbi1wbGF0Zm9ybSJdLCJjbGllbnRfaWQiOiJzcGEtZE92a0czWG0xRUtNRTlrb01adDN6VTU2dyIsImF1ZCI6WyJodHRwczovL2ltcy5iZW50bGV5LmNvbS9hcy90b2tlbi5vYXV0aDIiLCJodHRwczovL2ltc29pZGMuYmVudGxleS5jb20vYXMvdG9rZW4ub2F1dGgyIiwiaHR0cHM6Ly9pbXNvaWRjLmJlbnRsZXkuY29tL3Jlc291cmNlcyIsImJlbnRsZXktYXBpLW1hbmFnZW1lbnQiXSwic3ViIjoiYzA5NjQzOTAtMzMwNS00MTRkLWI4ODctNTQ3NTNkOTA0MTEyIiwicm9sZSI6WyJNWV9TRUxFQ1RfQ0QiLCJJTVNPSURDIEFkbWluIiwiUHJvamVjdCBNYW5hZ2VyIiwiU0VMRUNUX0RPV05MT0FEIiwiQkVOVExFWV9FTVBMT1lFRSJdLCJvcmciOiJmYWI5Nzc0Yi1iMzM4LTRjYzItYTZjOS00NThiZGY3Zjk2NmEiLCJzdWJqZWN0IjoiYzA5NjQzOTAtMzMwNS00MTRkLWI4ODctNTQ3NTNkOTA0MTEyIiwiYW1yIjpbIkJlbnRsZXlJZCIsImZlZCJdLCJpc3MiOiJodHRwczovL2ltcy5iZW50bGV5LmNvbSIsImVudGl0bGVtZW50IjpbIiJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJMaW5hcy5CdXJuZWlrYUBiZW50bGV5LmNvbSIsImdpdmVuX25hbWUiOiJMaW5hcyIsInNpZCI6Ik5VcnRUeDh0WFpCMnV1TXlfM0p0R3AyVzV6TS5TVTFUTFVKbGJuUnNaWGt0UkVVLnpTNGwuQzdRd2drMXdIOTgyM3R1YVNrS21tZXZwMyIsIm5iZiI6MTc1ODI3NjkxNCwidWx0aW1hdGVfc2l0ZSI6IjEwMDEzODkxMTciLCJ1c2FnZV9jb3VudHJ5X2lzbyI6IkdCIiwiYXV0aF90aW1lIjoxNzU4Mjc3MjE0LCJuYW1lIjoiTGluYXMuQnVybmVpa2FAYmVudGxleS5jb20iLCJvcmdfbmFtZSI6IkJlbnRsZXkgU3lzdGVtcyBJbmMiLCJmYW1pbHlfbmFtZSI6IkJ1cm5laWthIiwiZW1haWwiOiJMaW5hcy5CdXJuZWlrYUBiZW50bGV5LmNvbSIsImV4cCI6MTc1ODI4MDgyOX0.nkVFblSqUP7GA4ts1n4k3VCBLL0B9J9YplokPRYGnRgzPfsWA53bwlxI4wK5tX-bj1zyaIbePLvCngPo5PH7jjaC2Lmu42jYNUZV6EYCNg8Lim8Srd4ePqkWAo6Ekvnh2hPKayXIKrQlX-45AYkTRjsoXMQ2oa59X5mxbwI6w4FkL-HLBh157xVDqiiJR_6L_KRAShISu7ig2PCZOxfBQ8f6yMUl-toDJvGmOqeZqnrlkITnQKadEyyGbl_piY56mW6Ku9Xiu5ZxxCbRdQtmDy98AgUjdoz-s85qnZR6hTxailPxp6ST9YND4QZChdmHLd8yDWK-od_fNAhmco3Opg"
  );
  }
  return {
    client,
    state: AuthorizationState.Authorized,
  };
};

export function AuthorizationProvider(props: PropsWithChildren<unknown>) {
  const [contextValue, setContextValue] = useState<AuthorizationContext>(() =>
    createAuthClient()
  );

  const authClient = contextValue.client;
  useEffect(() => {
    return authClient.onAccessTokenChanged.addListener(() =>
      setContextValue((prev) => ({
        ...prev,
        state: AuthorizationState.Authorized,
      }))
    );
  }, [authClient]);

  useEffect(() => {
    const signIn = async () => {
      try {
        await authClient.signInSilent();
      } catch {
        await authClient.signInRedirect();
      }
    };

    //void signIn();
  }, [authClient]);

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

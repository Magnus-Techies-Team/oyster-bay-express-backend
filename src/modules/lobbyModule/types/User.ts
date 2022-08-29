import {userState, userStatus} from "~/modules/lobbyModule/types/lobbyConstants";

export type BasicUserInfo = {
  user_id: string;
  user_name: string;
  status: userStatus
  state: userState;
};

export type ExtendedUserInfo = BasicUserInfo & {points: number;};

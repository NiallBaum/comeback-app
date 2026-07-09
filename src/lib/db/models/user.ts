// Collection: users — Steam ID + linked profile info (spec section 6)
export interface UserDoc {
  steamId: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string;
}

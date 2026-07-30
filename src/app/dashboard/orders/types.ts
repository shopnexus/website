export type RoleState = 'buying' | 'selling';

export interface OrderFeedItem {
  id: string;
  name: string;
  role: string;
  price: string;
  status: string;
  statusColor: string;
  action: string;
  imgAlt: string;
  image: string;
}

export interface OrderStats {
  stat1Value: string | number;
  stat2Label: string;
  stat2Value: string | number;
  stat3Label: string;
  stat3Value: string;
}


export const SpeedProviders = [
  {
    provide: 'DB_CONNECTION',
    useFactory: async () => {
        return 'connections from providers';
    },
  },
];

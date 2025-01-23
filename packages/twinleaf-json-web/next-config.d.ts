declare module "next/config" {
  type ConfigTypes = () => {
    publicRuntimeConfig: {
      modifiedDate: string;
    };
  };

  declare const getConfig: ConfigTypes;

  export default getConfig;
}

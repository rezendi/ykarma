class util {
  static testMode() {
    return false;
  };

  static getWebTestUser() {
    return {
      displayName: "Test User",
      email: "test@rezendi.com",
      emailVerified: true,
      uid: "test",
      handle: "testuser",
      providerData: "password",
      yk: {
        id: 99,
        metadata: { name: "Tester User" },
        givable: 100,
        given: [{"sender":99,"receiver":2,"amount":40,"available":10,"message":"OK howdy","tags":"cool"}],
        received: [{"sender":1,"receiver":99,"amount":40,"available":40,"message":"Just a message","tags":"cool"},{"sender":1,"receiver":99,"amount":20,"available":20,"message":"Another message","tags":"cool"}],
      }
    };
  }
}

export default util;

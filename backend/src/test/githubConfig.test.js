const { getGithubConfig } = require("../config/github");

describe("GitHub owner configuration", () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  test("uses the official organization owner format", () => {
    process.env.GITHUB_OWNER = "gfg-rbu";
    process.env.GITHUB_OWNER_TYPE = "organization";
    const config = getGithubConfig();
    expect(config.owner).toBe("gfg-rbu");
    expect(config.ownerType).toBe("organization");
  });

  test("rejects unsupported owner type through env validation", () => {
    process.env.GITHUB_OWNER = "gfg-rbu";
    process.env.GITHUB_OWNER_TYPE = "bad";
    expect(() => require("../config/env").validateEnv()).toThrow("GITHUB_OWNER_TYPE");
  });
});

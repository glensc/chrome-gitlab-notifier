global.window = require("mithril/test-utils/browserMock.js")();
global.document = window.document;

const assert = require("power-assert");
const nock = require("nock");
const GitLab = require("../src/gitlab.es6");
const projects = require("./projects.json");

describe("GitLab", () => {
  const private_token = "xxxxxxxxxx";
  let gitlab;

  beforeEach(() =>{
    gitlab = new GitLab({
      api_path: "http://example.com/api/v3",
      private_token: private_token,
    });
  });

  describe("#loadProjects", () => {
    beforeEach(() =>{
      window.$defineRoutes({
        "GET /api/v3/projects": () =>{
          return {status: 200, responseTest: JSON.stringify(projects)}
        }
      });
      // nock("http://example.com", {
      //   reqheaders: {
      //     "PRIVATE-TOKEN": private_token,
      //   }
      // }).
      // get("/api/v3/projects").
      // query({
      //   page: 1,
      //   per_page: 100,
      //   order_by: "name",
      //   sort: "asc"
      // }).
      // reply(200, projects);

    });

    it("should return projects", (done) => {
      gitlab.loadProjects().then((projects) => {
        assert(projects.length == 2);
        done();
      });
    });
  });
});

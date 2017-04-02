try {
  var m = require("mithril");
} catch (e){
}

class GitLab {
  constructor(args = {}) {
    // remove end of "/"
    this.api_path = args.api_path.replace(/\/+$/, "");

    this.private_token = args.private_token;
    this.polling_second = args.polling_second;
    this.per_page = args.per_page || 100;
    this.projects = null;
  }

  static createFromConfig() {
    return new GitLab({
      api_path: config.getApiPath(),
      private_token: config.getPrivateToken(),
      polling_second: config.getPollingSecond(),
    })
  }

  loadProjects() {
    this.projects = null;
    return this.loadProjectsBase(1, [])
  }

  loadProjectsBase(page, all_projects) {
    // List projects
    // GET /projects
    // https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/projects.md#list-projects
    // NOTE: order_by and sort are supported by v7.7.0+. If no options, order_by created_at DESC
    return m.request({
      url: `${this.api_path}/projects`,
      method: "GET",
      data: {
        page: page,
        per_page: this.per_page,
        order_by: "name",
        sort: "asc"
      },
      headers: {
        "PRIVATE-TOKEN": this.private_token
      }
    }).then((projects) => {
      all_projects = all_projects.concat(projects);

      if (projects.length < this.per_page) {
        // final page
        this.projects = all_projects;
        return Promise.resolve(all_projects)
      } else {
        // paging
        return this.loadProjectsBase(page + 1, all_projects)
      }
    // TODO
    // }).catch((e) => {
    //   if(!this.projects) {
    //     this.projects = [];
    //   }
    //   alert(e);
    //   return Promise.reject()
    });
  }

  loadAvatarUrls(user_ids) {
    this.avatar_urls = {};
    user_ids.forEach((user_id) => {
      const cached_avatar_url = avatar_cache.get(user_id);
      if (cached_avatar_url) {
        this.avatar_urls[user_id] = cached_avatar_url;
        return;
      }

      this.getUserAvatarUrl(user_id).then((user) => {
        avatar_cache.set(user_id, user.avatar_url);
        this.avatar_urls[user_id] = user.avatar_url;
      })
    });
  }

  getUserAvatarUrl(user_id) {
    // Single user
    // GET /users/:id
    // https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/users.md#single-user
    return m.request({
      url: `${this.api_path}/users/:user_id`,
      method: "GET",
      data: {
        user_id: user_id
      },
      headers: {
        "PRIVATE-TOKEN": this.private_token
      }
    })
  }
}

try {
  module.exports = GitLab;
} catch (e){
}

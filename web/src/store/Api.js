class Api {  
  static loadCommunities() {
    return fetch('/communities')
      .then(response => {
        return response.json();
      }).catch(error => {
      return error;
    });
  }
}

export default Api;
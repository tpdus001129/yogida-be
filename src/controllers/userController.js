import * as userService from '../services/userService.js';

export async function getUser(req, res) {
  // url로 넘긴 데이터는 req.query 로 받는다.
  // ex) ?name=koo&habit=eating
  // const query = req.query;
  console.log(req.query);
  // body로 넘긴 데이터는 req.body 로 받는다.
  console.log(req.body);

  // params로 넘긴 데이터는 req.params 로 받는다.
  // ex) /users/10
  // ex) get('/users/:userId', ... ) <- userId 가 params
  const { userId } = req.params;
  console.log(req.params); // { userId : 10 }
  const user = await userService.getUser(userId);

  res.status(200).json(user);
}

const updateUserAndEvent = (from, to, id, userId, idList, user, events) => {
  user[from].pull(id);
  user[to].push(id);

  const i = idList.indexOf(id);
  events[i][from].pull(userId);
  events[i][to].push(userId);

  return [user, events];
};

const updateEventStatus = (newIdList, user, events, to, userId) => {
  let userAndEvents;

  newIdList.map((id) => {
    if (user.onbepaald.indexOf(id) !== -1) {
      userAndEvents = updateUserAndEvent(
        "onbepaald",
        to,
        id,
        userId,
        newIdList,
        user,
        events
      );
      user = userAndEvents[0];
      events = userAndEvents[1];
    } else if (to === "aanwezig") {
      if (user.afwezig.indexOf(id) !== -1) {
        userAndEvents = updateUserAndEvent(
          "afwezig",
          to,
          id,
          userId,
          newIdList,
          user,
          events
        );
        user = userAndEvents[0];
        events = userAndEvents[1];
      }
    } else if (to === "afwezig") {
      if (user.aanwezig.indexOf(id) !== -1) {
        userAndEvents = updateUserAndEvent(
          "aanwezig",
          to,
          id,
          userId,
          newIdList,
          user,
          events
        );
        user = userAndEvents[0];
        events = userAndEvents[1];
      }
    }
  });
  return [user, events];
};

module.exports = updateEventStatus;

const state = {
  users: [],
  links: []
};

function init() {
  // seed with a sample user and links
  if (state.users.length === 0) {
    const user = { id: '1', name: 'Sample User', email: 'sample@example.com', passwordHash: '', theme: 'light' };
    state.users.push(user);
    state.links.push({ id: 'l1', userId: '1', title: 'Portfolio', url: 'https://example.com', order: 0, visible: true });
  }
}

async function findUserByEmail(email) {
  return state.users.find((u) => u.email === email) || null;
}

async function findUserById(id) {
  return state.users.find((u) => String(u.id) === String(id)) || null;
}

async function createUser({ name, email, passwordHash }) {
  const id = String(state.users.length + 1);
  const user = { id, name, email, passwordHash, theme: 'light' };
  state.users.push(user);
  return user;
}

async function createLink({ userId, title, url }) {
  const id = `m${state.links.length + 1}`;
  const link = { id, userId, title, url, order: state.links.length, visible: true };
  state.links.push(link);
  return link;
}

async function findLinksByUserId(userId) {
  return state.links.filter((l) => String(l.userId) === String(userId));
}

async function deleteLinkById(id) {
  const idx = state.links.findIndex((l) => String(l.id) === String(id));
  if (idx >= 0) state.links.splice(idx, 1);
  return true;
}

export default { init, findUserByEmail, findUserById, createUser, createLink, findLinksByUserId, deleteLinkById };

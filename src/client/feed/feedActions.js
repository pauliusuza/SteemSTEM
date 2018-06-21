import { getDiscussionsFromAPI } from '../helpers/apiHelpers';
import {
  createAsyncActionType,
  getFeedFromState,
  getFeedLoadingFromState,
} from '../helpers/stateHelpers';
import {
  getAuthenticatedUserName,
  getFeed,
  getPosts,
  getBookmarks as getBookmarksSelector,
} from '../reducers';

export const GET_FEED_CONTENT = createAsyncActionType('@feed/GET_FEED_CONTENT');
export const GET_MORE_FEED_CONTENT = createAsyncActionType('@feed/GET_MORE_FEED_CONTENT');

export const GET_USER_COMMENTS = createAsyncActionType('@feed/GET_USER_COMMENTS');
export const GET_MORE_USER_COMMENTS = createAsyncActionType('@feed/GET_MORE_USER_COMMENTS');

export const GET_REPLIES = createAsyncActionType('@user/GET_REPLIES');
export const GET_MORE_REPLIES = createAsyncActionType('@user/GET_MORE_REPLIES');

export const GET_BOOKMARKS = createAsyncActionType('@bookmarks/GET_BOOKMARKS');

const whitelist = ['suesa', 'steemstem', 'socky', 'egotheist'];

export const filterByVoters = function filterByVoters (posts, category, slice = false) {
  let retval = slice ? posts.slice(1) : posts;
  if(category === 'steemstem-curated') {
    retval = retval.filter((p) => {
      const found = p.active_votes.filter((v) => {
        return v.voter === 'steemstem';
      });
      return found.length > 0;
    });
  } else if(category === 'steemstem-featured'){
    retval = retval.filter((p) => {
      return (whitelist.indexOf(p.author) !== -1);
    });
    retval = retval.filter((p) => {
      const found = p.active_votes.filter((v) => {
        return v.voter === 'steemstem';
      });
      return found.length > 0;
    });
  }
  return retval;
}

const getFilteredDiscussion = function getFilteredDiscussion(sortBy, category, limit, steemAPI, last) {
  return new Promise(async (resolve, reject) => {
    let total = [];
    let counter = 0;
    while(total.length < limit) {
      if(total.length > 0 && counter > 0) {
        const lastPost = total[total.length - 1];
        const startAuthor = lastPost.author;
        const startPermlink = lastPost.permlink;
        const r = filterByVoters(await getDiscussionsFromAPI(sortBy, { tag: pickCat(category, 'steemstem', true), limit: limit - total.length + counter + 1, start_author: startAuthor, start_permlink: startPermlink }, steemAPI), category, true);
        total = total.concat(r);
        //console.log('second', r);
      } else {
        if(last) {
          const startAuthor = last.author;
          const startPermlink = last.permlink;
          const r = filterByVoters(await getDiscussionsFromAPI(sortBy, { tag: pickCat(category, 'steemstem', true), limit: limit - total.length + counter + 1, start_author: startAuthor, start_permlink: startPermlink }, steemAPI), category, true);
          total = total.concat(r);
          //console.log('first-more', r);
        } else {
          const r = filterByVoters(await getDiscussionsFromAPI(sortBy, { tag: pickCat(category, 'steemstem', true), limit: limit + counter }, steemAPI), category);
          total = total.concat(r);
          //console.log('first', total, limit + counter);
        }
      }
      counter++;
      if(counter > 3) {
        resolve(total.slice(0, limit));
        break;
      }
    }
    //console.log(total.length, limit)
    return resolve(total.slice(0, limit));
  });
}

export const pickCat = function pickCat(category, revert, isTag) {
  return (!category || (isTag && (category === 'steemstem-curated' || category === 'steemstem-featured')) ? revert : category);
}

export const getFeedContent = ({ sortBy = 'trending', category, limit = 20 }) => (
  dispatch,
  getState,
  { steemAPI },
) => {
  return dispatch({
    type: GET_FEED_CONTENT.ACTION,
    payload: getFilteredDiscussion(sortBy, category, limit, steemAPI),
    meta: {
      sortBy,
      category: pickCat(category, 'steemstem'),
      limit,
    },
  })
}

export const getMoreFeedContent = ({ sortBy, category, limit = 20 }) => (
  dispatch,
  getState,
  { steemAPI },
) => {
  const state = getState();
  const feed = getFeed(state);
  const posts = getPosts(state);
  const feedContent = getFeedFromState(sortBy, pickCat(category, 'steemstem'), feed);

  if (!feedContent.length) return Promise.resolve(null);

  const lastPost = posts[feedContent[feedContent.length - 1]];

  const startAuthor = lastPost.author;
  const startPermlink = lastPost.permlink;

  return dispatch({
    type: GET_MORE_FEED_CONTENT.ACTION,
    payload: getFilteredDiscussion(sortBy, category, limit, steemAPI, lastPost), /*getDiscussionsFromAPI(
      sortBy,
      {
        tag: pickCat(category, 'steemstem'),
        limit: limit + 1,
        start_author: startAuthor,
        start_permlink: startPermlink,
      },
      steemAPI,
    ).then((postsData) => { return filterByVoters(postsData, category).slice(1); }),*/
    meta: {
      sortBy,
      category: pickCat(category, 'steemstem'),
      limit,
    },
  });
};

export const getUserComments = ({ username, limit = 20 }) => (dispatch, getState, { steemAPI }) => {
  const state = getState();
  const feed = getFeed(state);

  if (feed.comments[username] && feed.comments[username].isLoaded) {
    return null;
  }

  return dispatch({
    type: GET_USER_COMMENTS.ACTION,
    payload: steemAPI
      .sendAsync('get_discussions_by_comments', [{ start_author: username, limit }])
      .then(postsData => postsData),
    meta: { sortBy: 'comments', category: username, limit },
  });
};

export const getMoreUserComments = ({ username, limit = 20 }) => (
  dispatch,
  getState,
  { steemAPI },
) => {
  const state = getState();
  const feed = getFeed(state);
  const posts = getPosts(state);

  const feedContent = getFeedFromState('comments', username, feed);
  const isLoading = getFeedLoadingFromState('comments', username, feed);

  if (!feedContent.length || isLoading) {
    return null;
  }

  const lastPost = posts[feedContent[feedContent.length - 1]];

  const startAuthor = lastPost.author;
  const startPermlink = lastPost.permlink;

  return dispatch({
    type: GET_MORE_USER_COMMENTS.ACTION,
    payload: steemAPI
      .sendAsync('get_discussions_by_comments', [
        {
          start_author: startAuthor,
          start_permlink: startPermlink,
          limit: limit + 1,
        },
      ])
      .then(postsData => postsData.slice(1)),
    meta: { sortBy: 'comments', category: username, limit },
  });
};

export const getReplies = () => (dispatch, getState, { steemAPI }) => {
  const state = getState();
  const category = getAuthenticatedUserName(state);

  dispatch({
    type: GET_REPLIES.ACTION,
    payload: steemAPI
      .sendAsync('get_state', [`/@${category}/recent-replies`])
      .then(apiRes => Object.values(apiRes.content).sort((a, b) => b.id - a.id)),
    meta: { sortBy: 'replies', category, limit: 50 },
  });
};

export const getMoreReplies = () => (dispatch, getState, { steemAPI }) => {
  const state = getState();
  const feed = getFeed(state);
  const posts = getPosts(state);
  const category = getAuthenticatedUserName(state);

  const lastFetchedReplyId =
    feed.replies[category] && feed.replies[category].list[feed.replies[category].list.length - 1];

  if (!lastFetchedReplyId) {
    return null;
  }

  const startAuthor = posts.list[lastFetchedReplyId].author;
  const startPermlink = posts.list[lastFetchedReplyId].permlink;
  const limit = 10;

  return dispatch({
    type: GET_MORE_REPLIES.ACTION,
    payload: steemAPI
      .sendAsync('get_replies_by_last_update', [startAuthor, startPermlink, limit + 1])
      .then(postsData => postsData.slice(1)),
    meta: { sortBy: 'replies', category, limit },
  });
};

/**
 * Use async await to load all the posts of bookmarked from steemAPI and returns a Promise
 *
 * @param bookmarks from localStorage only contain author and permlink
 * @param steemAPI
 * @returns Promise - bookmarksData
 */
async function getBookmarksData(bookmarks, steemAPI) {
  const bookmarksData = [];
  for (let idx = 0; idx < Object.keys(bookmarks).length; idx += 1) {
    const postId = Object.keys(bookmarks)[idx];

    const postData = steemAPI.sendAsync('get_content', [
      bookmarks[postId].author,
      bookmarks[postId].permlink,
    ]);
    bookmarksData.push(postData);
  }
  return Promise.all(bookmarksData.sort((a, b) => a.timestamp - b.timestamp).reverse());
}

export const getBookmarks = () => (dispatch, getState, { steemAPI }) => {
  const state = getState();
  const bookmarks = getBookmarksSelector(state);

  dispatch({
    type: GET_BOOKMARKS.ACTION,
    payload: getBookmarksData(bookmarks, steemAPI).then(posts =>
      posts.filter(post => post.id !== 0),
    ),
    meta: {
      sortBy: 'bookmarks',
      category: 'all',
      once: true,
    },
  });
};

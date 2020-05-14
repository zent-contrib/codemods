import { InfiniteScroller } from 'zent';

const flag = false;

// console.log(<InfiniteScroller initialLoad={!flag}></InfiniteScroller>);
console.log(<InfiniteScroller initialLoad={!!flag}></InfiniteScroller>);

// console.log(<InfiniteScroller initialLoad={flag}></InfiniteScroller>);
console.log(<InfiniteScroller initialLoad={!flag}></InfiniteScroller>);

// console.log(<InfiniteScroller initialLoad={false}></InfiniteScroller>);
console.log(<InfiniteScroller initialLoad={true}></InfiniteScroller>);

// console.log(<InfiniteScroller initialLoad={true}></InfiniteScroller>);
console.log(<InfiniteScroller initialLoad={false}></InfiniteScroller>);

// console.log(<InfiniteScroller initialLoad></InfiniteScroller>);
console.log(<InfiniteScroller initialLoad={false}></InfiniteScroller>);

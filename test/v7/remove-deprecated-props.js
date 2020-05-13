import {
  Button,
  Pagination,
  Grid,
  Table,
  Loading,
  Tag,
  BlockHeader,
  Tabs,
} from 'zent';

// console.log(<Button component={() => null}></Button>)
console.log(<Button component={() => null}></Button>);

// console.log(
//   <Pagination onPageSizeChange={() => {}} maxPageToShow={100}></Pagination>
// );
console.log(
  <Pagination onPageSizeChange={() => {}} maxPageToShow={100}></Pagination>
);

// console.log(<Grid onPageSizeChange={() => {}}></Grid>);
console.log(<Grid onPageSizeChange={() => {}}></Grid>);

// console.log(<Table onPageSizeChange={() => {}}></Table>);
console.log(<Table onPageSizeChange={() => {}}></Table>);

// console.log(<Loading containerClass="a" />);
console.log(<Loading containerClass="a" />);

// console.log(<Tag onVisibleChange={() => {}} borderColor bgColor fontColor closeButtonFontColor />);
console.log(
  <Tag
    onVisibleChange={() => {}}
    borderColor
    bgColor
    fontColor
    closeButtonFontColor
  />
);

// console.log(<BlockHeader>I am children</BlockHeader>);
console.log(<BlockHeader>I am children</BlockHeader>);

// console.log(<Tabs onTabReady></Tabs>)
console.log(<Tabs onTabReady></Tabs>);

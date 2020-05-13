import {
  Button,
  Pagination,
  Grid,
  Table,
  Loading,
  Tree,
  NumberInput,
  Layout,
  tag,
  Portal,
  LayeredPortal,
  SearchInput,
} from 'zent';
import { Link } from 'react-router';

const { Row, Col } = Layout;

// console.log(<Button component={Link}></Button>)
console.log(<Button component={Link}></Button>);

// console.log(
//   <Pagination
//     maxPageToShow
//     pageSize
//     onPageSizeChange
//     onChange={() => {}}
//   ></Pagination>
// );
console.log(
  <Pagination
    maxPageToShow
    pageSize
    onPageSizeChange
    onChange={() => {}}
  ></Pagination>
);

// console.log(<Grid pageInfo></Grid>);
console.log(<Grid pageInfo onPageSizeChange></Grid>);

// console.log(<Table pageInfo></Table>);
console.log(<Table pageInfo onPageSizeChange></Table>);

// console.log(<Loading float={flag}></Loading>);
console.log(<Loading float={flag}></Loading>);

// console.log(<Tree onCheck></Tree>);
console.log(<Tree onCheck></Tree>);

// console.log(<NumberInput onChange></NumberInput>);
console.log(<NumberInput onChange></NumberInput>);

// console.log(<Row></Row>);
console.log(<Row></Row>);

// console.log(<Col></Col>);
console.log(<Col></Col>);

// console.log(
//   <Tag
//     onVisibleChange
//     borderColor
//     bgColor
//     fontColor
//     closeButtonFontColor
//     color
//   ></Tag>
// );
console.log(
  <Tag
    onVisibleChange
    borderColor
    bgColor
    fontColor
    closeButtonFontColor
    color
  ></Tag>
);

// console.log(<Portal></Portal>);
console.log(<Portal></Portal>);

// console.log(<LayeredPortal></LayeredPortal>);
console.log(<LayeredPortal></LayeredPortal>);

// console.log(<SearchInput />);
console.log(<SearchInput />);

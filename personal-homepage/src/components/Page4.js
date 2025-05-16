import React from 'react';
import Layout from './Layout';

const Page4 = () => {
  return (
    <Layout>
      <div className="page4-content">
        <h1>文段展示2</h1>
        <div className="code-showcase">
          {/* 这里可以根据原来的page4.html内容进行转换 */}
          <div className="code-item">
            <h2>代码示例</h2>
            <pre>
              <code>
                {`function example() {
  console.log("Hello, world!");
  return true;
}`}
              </code>
            </pre>
            <p>代码说明...</p>
          </div>
          
          <div className="code-item">
            <h2>另一个代码示例</h2>
            <pre>
              <code>
                {`const reactComponent = () => {
  return <div>Hello React</div>;
};`}
              </code>
            </pre>
            <p>代码说明...</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Page4; 
import React from 'react';
import Layout from './Layout';

const Page3 = () => {
  return (
    <Layout>
      <div className="page3-content">
        <h1>文段展示1</h1>
        <div className="text-showcase">
          {/* 这里可以根据原来的page3.html内容进行转换 */}
          <article className="text-item">
            <h2>文章标题</h2>
            <p>文章内容...</p>
            <p>更多内容...</p>
          </article>
          
          <article className="text-item">
            <h2>另一篇文章</h2>
            <p>文章内容...</p>
            <p>更多内容...</p>
          </article>
        </div>
      </div>
    </Layout>
  );
};

export default Page3; 
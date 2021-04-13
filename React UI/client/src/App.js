import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Divider, Table, Layout, Spin, Card, Tabs } from 'antd';
import Dropzone from 'react-simple-dropzone/dist';
import { Chart } from "react-google-charts";
import logo from './logo.png';
import './App.css';

function App() {


    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [productData, setProductData] = useState([]);
    const [labelData, setLabelData] = useState([]);
    const [productDetails, setProductDetails] = useState({});
    const [form] = Form.useForm();
    const [image, setImage] = useState(null);


    //antd layout
    const { Header, Content } = Layout;
    const { Meta } = Card;

    //antd form layout

    const formItemLayout = {
        labelCol: { span: 12 },
        wrapperCol: { span: 12 },
    };

    const tailLayout = {
        wrapperCol: {
            offset: 16,
            span: 16,
        },
    };

    const { TabPane } = Tabs;
 
    //antd table definition
    const columns = [
        { title: 'Product ID', dataIndex: 'ProductID', key: 'ProductID', },
        { title: 'Description', dataIndex: 'Description', width: '42%' },
        { title: 'UOM', dataIndex: 'BaseUOMText', width: '15%', },
        {
            title: 'Action',
            dataIndex: '',
            key: 'ProductID',
            render: (row) => <a href="javascript:;" onClick={() => getDetails({ row })}>Details</a>,
            width: '15%',

        },
    ];

    const getProducts = function (values) {
        setProductDetails({});
        setLoadingProducts(true);
        setLabelData([]);

        let headers = { 'Content-type': 'application/json' };
        let body = { a: 1 };

        if (values.id)
            headers.product_id = values.id;

        if (values.desc)
            headers.product_desc = values.desc;

        if (image) {
            let base64 = image.slice(image.indexOf("base64,") + 7);
            body = { Image: { Bytes: base64 } };
        }

        fetch('/products', {
            method: 'post',
            body: JSON.stringify(body),
            headers: headers
        }).then(res => res.json())
            .then(data => {
                setProductData(data.products);
                if (data.labels.length > 1)
                  setLabelData(data.labels);
            });

    }

    const getDetails = (o) => {

        setProductDetails({});
        setLoadingDetails(true);

        let headers = { 'Content-type': 'application/json' };
        headers.product_id = o.row.ProductID;

        fetch('/details', {
            method: 'get',
            headers: headers
        }).then(res => res.json())
            .then(data => {
                data.label = 'data: image / png; base64,' + data.label;
                setProductDetails(data)
            });

    };

    setTimeout(() => {
        setLoadingProducts(false);
        setLoadingDetails(false);
    }, 3000)

    return (

        <Layout className='layout'>
             
            <Header className='Header'><img src={logo} class='header-image' /></Header>
            <div class="fade_rule"></div> 
            <Content>
                <Row className='Row-Content'>
                    <Col span={4} order={1} className='column column-form'>
                        <div className='edge'>
                        {loadingProducts && <div>Searching Products...</div>}
                        <Form layout='vertical' form={form} name="control-hooks" onFinish={getProducts}>
                            <Form.Item name="id" label="Search Products by ID" disabled={loadingProducts}>
                                <Input disabled={loadingProducts} />
                            </Form.Item>

                            <Form.Item name="desc" label="Search Products by Description" >
                                <Input disabled={loadingProducts} />
                            </Form.Item>

                            <Form.Item name="drop" label="Search Products by Image" >
                                <Dropzone
                                    validtypes={['image/jpeg', 'image/png']}
                                    onSuccessB64={(img) => setImage(img)}
                                    displayText="Drag & Drop Images (jpg/png) or Click to Upload "
                                />
                            </Form.Item>

                            <Form.Item {...tailLayout} >
                                <Button type="submit" type="primary" htmlType="submit" disabled={loadingProducts}>Submit</Button>
                            </Form.Item>
                        </Form>
                            </div>
                    </Col>

                    <Col span={14} order={2} className='column'>
                        <Tabs defaultActiveKey="1"  >
                            <TabPane tab="Products" key="1">
                                <Spin spinning={loadingProducts} delay={500}>
                                    <Table columns={columns} dataSource={productData} scroll={{ y: 375 }} />
                                </Spin>
                            </TabPane>
                            {labelData.length > 0
                                ?
              
                                <TabPane tab="Image Recognition Results" key="2">
                                    <Spin spinning={loadingProducts} delay={500}>
                                        <div className={"my-pretty-chart-container"}>


                                            <Chart
                                                width={'100%'}
                                                height={'300px'}
                                                chartType="BarChart"
                                                loader={<div>Loading Chart</div>}
                                                data={labelData}
                                                options={{
                                                    title: 'Labels Returned from AWS Rekognition Service',
                                                    chartArea: { width: '50%' },
                                                    hAxis: {
                                                        title: 'Confidence',
                                                        maxValue: 100,
                                                        minValue: 0,
                                                    },
                                                    vAxis: {
                                                        title: 'Label',
                                                    },
                                                }}
                                            />

                                        </div>
                                    </Spin>
                                </TabPane>
                                        
                                :
                                <div />
                            }
                        </Tabs>
                    </Col>

                    <Col span={6} order={3} className='column' >
                        {(Object.keys(productDetails).length === 0 && !loadingDetails)
                            ?
                            <div />
                            :
                            <Card loading={loadingDetails}  >
                                <Meta
                                    title={productDetails.ProductID}
                                    description={productDetails.Description}
                                />
                                <Divider />
                                <Form coloon={true} size='small' {...formItemLayout}>
                                    <Form.Item label='Unit of Measure'>
                                        {productDetails.BaseUOMText} ({productDetails.BaseUOM})
                                    </Form.Item>
                                    <Form.Item label='Category'>
                                        {productDetails.ProductCategoryID}
                                    </Form.Item>
                                    <Form.Item label='QR Code Label'>
                                        <img src={productDetails.label} class='details-image' />
                                    </Form.Item>
                                    <Form.Item label='Product Image'>
                                        <img src={productDetails.ImageURL} class='details-image' onerror="this.style.display='none'" />
                                    </Form.Item>
                                </Form>
                            </Card>
                        }

                    </Col>
                </Row>

            </Content>
        </Layout>
    );
}

export default App;
import React from 'react';
import { Modal, Form, Row, Col, Button, message, Input, Select } from 'antd';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { AddMovie, UpdateMovie } from '../../apicalls/movies';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

function MovieForm({
  showMovieFormModel,
  setShowMovieFormModel,
  selectedMovie,
  setSelectedMovie,
  getData,
  formType
}) {
  if(selectedMovie){
    selectedMovie.releaseDate=moment(selectedMovie.releaseDate).format('YYYY-MM-DD')
  }
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      let response = null;
      if (formType === 'add') {
        response = await AddMovie(values);
      } else {
        response=await UpdateMovie({
            ...values,
            movieId:selectedMovie._id
        })
        
      }

      if (response.success) {
        getData()
        message.success(response.message);
        setShowMovieFormModel(false);
      } else {
        message.error(response.message);
      }

      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <Modal
      title={formType === 'add' ? 'ADD Movie' : 'EDIT Movie'}
      open={showMovieFormModel}
      onCancel={() => {
        setShowMovieFormModel(false)
        setSelectedMovie(null)
      }}
      footer={null}
      width={800}
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={selectedMovie || {}}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Movie Name"
              name="title"
              rules={[{ required: true, message: 'Please enter movie name' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Movie Description"
              name="description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Duration"
              name="duration"
              rules={[{ required: true, message: 'Enter duration' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Language"
              name="language"
              rules={[{ required: true, message: 'Select language' }]}
            >
              <Select placeholder="Select Language">
                <Option value="English">English</Option>
                <Option value="Hindi">Hindi</Option>
                <Option value="Tamil">Tamil</Option>
                <Option value="Telugu">Telugu</Option>
                <Option value="Gujarati">Gujarati</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Date"
              name="releaseDate"
              rules={[{ required: true, message: ' Date' }]}
            >
              <Input type='date'
              min={moment().format("YYYY-MM-DD")}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Destination"
              name="genre"
              rules={[{ required: true, message: 'Select Destination' }]}
            >
              <Select placeholder="Select Genre">
                <Option value="Action">Action</Option>
                <Option value="Romance">Romance</Option>
                <Option value="Horror">Horror</Option>
                <Option value="Thriller">Thriller</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              label="Poster URL"
              name="poster"
              rules={[{ required: true, message: 'Enter poster URL' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <div className="flex justify-end gap-3">
        <Button onClick={() => {
            setShowMovieFormModel(false)
            selectedMovie(null)
        }}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default MovieForm;

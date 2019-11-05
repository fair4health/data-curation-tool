import {expect} from 'chai'
import {shallowMount} from '@vue/test-utils'
import Message from '@/components/Message.vue'

describe('Test components', () => {
  it('Renders props.msg', () => {
    const msg = 'new message';
    const wrapper = shallowMount(Message, {
      propsData: {msg},
    });
    expect(wrapper.text()).to.include(msg);
  })
});

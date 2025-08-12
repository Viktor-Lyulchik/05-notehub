import { Formik, Form, Field, ErrorMessage } from 'formik';
import type { FormikHelpers } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Yup from 'yup';

import css from './NoteForm.module.css';
import type { NotePost } from '../../types/note';
import { createNote } from '../../services/noteService';
import toast from 'react-hot-toast';

const initialFormValues: NotePost = {
  title: '',
  content: '',
  tag: 'Todo',
};

const OrderSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Too short!')
    .max(50, 'Too long!')
    .required('Required'),
  tag: Yup.string()
    .oneOf(['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'])
    .required('Required'),
  content: Yup.string().max(500, 'Too long!'),
});

interface NoteFormProps {
  onClose: () => void;
}

export default function NoteForm({ onClose }: NoteFormProps) {
  const queryClient = useQueryClient();

  const { mutate: postMutation, isPending } = useMutation({
    mutationFn: createNote,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      onClose();
    },
    onError() {
      toast.error('Error creating note!');
    },
  });

  const handleSubmit = async (
    values: NotePost,
    formikHelpers: FormikHelpers<NotePost>
  ) => {
    postMutation(values);
    formikHelpers.resetForm();
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={OrderSchema}
      onSubmit={handleSubmit}
    >
      <Form className={css.form}>
        <div className={css.formGroup}>
          <label htmlFor="title">Title</label>
          <Field id="title" type="text" name="title" className={css.input} />
          <ErrorMessage name="title" component="span" className={css.error} />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="content">Content</label>
          <Field
            as="textarea"
            id="content"
            name="content"
            rows={8}
            className={css.textarea}
          />
          <ErrorMessage name="content" component="span" className={css.error} />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="tag">Tag</label>
          <Field as="select" id="tag" name="tag" className={css.select}>
            <option value="Todo">Todo</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Meeting">Meeting</option>
            <option value="Shopping">Shopping</option>
          </Field>
          <ErrorMessage name="tag" component="span" className={css.error} />
        </div>

        <div className={css.actions}>
          <button type="button" className={css.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className={css.submitButton}
            disabled={isPending}
          >
            Create note
          </button>
        </div>
      </Form>
    </Formik>
  );
}

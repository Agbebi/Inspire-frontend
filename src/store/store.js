import { configureStore } from '@reduxjs/toolkit'
import schoolReducer from './superadmin/school-slice'
import superadminReducer from './superadmin/index'
import studentReducer from './admin/studentSlice'
import teacherReducer from './admin/teacherSlice'
import classReducer from './admin/classSlice'
import subjectReducer from './admin/subjectSlice'

const store = configureStore({

    reducer: {
        school: schoolReducer,
        superadmin: superadminReducer,
        student: studentReducer,
        teacher: teacherReducer,
        class: classReducer,
        subject: subjectReducer,
    }
})


export default store
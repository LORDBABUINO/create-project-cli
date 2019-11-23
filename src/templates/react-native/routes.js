import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

const Routes = createAppContainer(
  createStackNavigator(
    {
    },
    {
      headerLayoutPreset: 'center',
      headerBackTitleVisible: false,
      defaultNavigationOptions: {
        headerStyle: {
          backgroundColor: '#7159c1'
        },
        headerTintColor: 'white'
      }
    }
  )
)

export default Routes
